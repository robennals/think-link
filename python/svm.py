#!/usr/bin/env python

from ctypes import *
from ctypes.util import find_library
import sys

# For unix the prefix 'lib' is not considered.
if find_library('svm'):
	libsvm = CDLL(find_library('svm'))
elif find_library('libsvm'):
	libsvm = CDLL(find_library('libsvm'))
else  :
	if sys.platform == 'win32':
		libsvm = CDLL('../windows/libsvm.dll')
	else :
		libsvm = CDLL('../libsvm.so.1')

# Construct constants
SVM_TYPE = ['C_SVC', 'NU_SVC', 'ONE_CLASS', 'EPSILON_SVR', 'NU_SVR' ]
KERNEL_TYPE = ['LINEAR', 'POLY', 'RBF', 'SIGMOID', 'PRECOMPUTED']
for i, s in enumerate(SVM_TYPE): exec("%s = %d" % (s , i))
for i, s in enumerate(KERNEL_TYPE): exec("%s = %d" % (s , i))

PRINT_STRING_FUN = CFUNCTYPE(None, c_char_p)
def print_null(s): 
	return 

def genFields(names, types): 
	return list(zip(names, types))

def fillprototype(f, restype, argtypes): 
	f.restype = restype
	f.argtypes = argtypes

class svm_node(Structure):
	_names = ["index", "value"]
	_types = [c_int, c_double]
	_fields_ = genFields(_names, _types)

def gen_svm_nodearray(xi, feature_max=None, issparse=None):
	if isinstance(xi, dict):
		index_range = xi.keys()
	elif isinstance(xi, (list, tuple)):
		index_range = range(len(xi))
	else :
		raise TypeError('xi should be a dictionary, list or tuple')

	if feature_max :
		assert(isinstance(feature_max, int))
		index_range = filter(lambda j: j <= feature_max, index_range)
	if issparse : 
		index_range = filter(lambda j:xi[j] != 0, index_range)

	index_range = sorted(index_range)
	ret = (svm_node * (len(index_range)+1))()
	ret[-1].index = -1
	for idx, j in enumerate(index_range):
		ret[idx].index = j
		ret[idx].value = xi[j]
	max_idx = 0
	if index_range: 
		max_idx = index_range[-1]
	return ret, max_idx

class svm_problem(Structure):
	_names = ["l", "y", "x"]
	_types = [c_int, POINTER(c_double), POINTER(POINTER(svm_node))]
	_fields_ = genFields(_names, _types)

	def __init__(self, y, x):
		if len(y) != len(x) :
			raise ValueError("len(y) != len(x)")
		self.l = l = len(y)

		max_idx = 0
		x_space = self.x_space = []
		for i, xi in enumerate(x):
			tmp_xi, tmp_idx = gen_svm_nodearray(xi)
			x_space += [tmp_xi]
			max_idx = max(max_idx, tmp_idx)
		self.n = max_idx

		self.y = (c_double * l)()
		for i, yi in enumerate(y): self.y[i] = y[i]

		self.x = (POINTER(svm_node) * l)() 
		for i, xi in enumerate(self.x_space): self.x[i] = xi

class svm_parameter(Structure):
	_names = ["svm_type", "kernel_type", "degree", "gamma", "coef0",
			"cache_size", "eps", "C", "nr_weight", "weight_label", "weight", 
			"nu", "p", "shrinking", "probability"]
	_types = [c_int, c_int, c_int, c_double, c_double, 
			c_double, c_double, c_double, c_int, POINTER(c_int), POINTER(c_double),
			c_double, c_double, c_int, c_int]
	_fields_ = genFields(_names, _types)

	def __init__(self, options = None):
		if options == None:
			options = ''
		self.parse_options(options)

	def show(self):
		attrs = svm_parameter._names + self.__dict__.keys()
		values = map(lambda attr: getattr(self, attr), attrs) 
		for attr, val in zip(attrs, values):
			print(' %s: %s' % (attr, val))

	def set_to_default_values(self):
		self.svm_type = C_SVC;
		self.kernel_type = RBF
		self.degree = 3
		self.gamma = 0
		self.coef0 = 0
		self.nu = 0.5
		self.cache_size = 100
		self.C = 1
		self.eps = 0.001
		self.p = 0.1
		self.shrinking = 1
		self.probability = 0
		self.nr_weight = 0
		self.weight_label = (c_int*0)()
		self.weight = (c_double*0)()
		self.cross_validation = False
		self.nr_fold = 0
		self.print_func = None

	def parse_options(self, options):
		argv = options.split()
		self.set_to_default_values()
		self.print_func = cast(None, PRINT_STRING_FUN)
		weight_label = []
		weight = []

		i = 0
		while i < len(argv) :
			if argv[i] == "-s":
				i = i + 1
				self.svm_type = int(argv[i])
			elif argv[i] == "-t":
				i = i + 1
				self.kernel_type = int(argv[i])
			elif argv[i] == "-d":
				i = i + 1
				self.degree = int(argv[i])
			elif argv[i] == "-g":
				i = i + 1
				self.gamma = float(argv[i])
			elif argv[i] == "-r":
				i = i + 1
				self.coef0 = float(argv[i])
			elif argv[i] == "-n":
				i = i + 1
				self.nu = float(argv[i])
			elif argv[i] == "-m":
				i = i + 1
				self.cache_size = float(argv[i])
			elif argv[i] == "-c":
				i = i + 1
				self.C = float(argv[i])
			elif argv[i] == "-e":
				i = i + 1
				self.eps = float(argv[i])
			elif argv[i] == "-p":
				i = i + 1
				self.p = float(argv[i])
			elif argv[i] == "-h":
				i = i + 1
				self.shrinking = int(argv[i])
			elif argv[i] == "-b":
				i = i + 1
				self.probability = int(argv[i])
			elif argv[i] == "-q":
				self.print_func = PRINT_STRING_FUN(print_null)
			elif argv[i] == "-v":
				i = i + 1
				self.cross_validation = 1
				self.nr_fold = int(argv[i])
				if self.nr_fold < 2 :
					raise ValueError("n-fold cross validation: n must >= 2")
			elif argv[i].startswith("-w"):
				i = i + 1
				self.nr_weight += 1
				nr_weight = self.nr_weight
				weight_label += [int(argv[i-1][2:])]
				weight += [float(argv[i])]
			else:
				raise ValueError("Wrong options")
			i += 1

		libsvm.svm_set_print_string_function(self.print_func)
		self.weight_label = (c_int*self.nr_weight)()
		self.weight = (c_double*self.nr_weight)()
		for i in range(self.nr_weight): 
			self.weight[i] = weight[i]
			self.weight_label[i] = weight_label[i]

class svm_model(Structure):
	def __init__(self):
		self.__createfrom__ = 'python'

	def __del__(self):
		# free memory created by C to avoid memory leak
		if hasattr(self, '__createfrom__') and self.__createfrom__ == 'C':
			libsvm.svm_destroy_model(self)

	def get_svm_type(self):
		return libsvm.svm_get_svm_type(self)

	def get_nr_class(self):
		return libsvm.svm_get_nr_class(self)

	def get_svr_probability(self):
		return libsvm.svm_get_svr_probability(self)

	def get_labels(self):
		nr_class = self.get_nr_class()
		labels = (c_int * nr_class)()
		libsvm.svm_get_labels(self, labels)
		return labels[:nr_class]

	def is_probability_model(self):
		return (libsvm.svm_check_probability_model(self) == 1)

def toPyModel(model_ptr):
	"""
	toPyModel(model_ptr) -> svm_model

	Convert a ctypes POINTER(svm_model) to a Python svm_model
	"""
	if bool(model_ptr) == False:
		raise ValueError("Null pointer")
	m = model_ptr.contents
	m.__createfrom__ = 'C'
	return m

fillprototype(libsvm.svm_train, POINTER(svm_model), [POINTER(svm_problem), POINTER(svm_parameter)])
fillprototype(libsvm.svm_cross_validation, None, [POINTER(svm_problem), POINTER(svm_parameter), c_int, POINTER(c_double)])

fillprototype(libsvm.svm_save_model, c_int, [c_char_p, POINTER(svm_model)])
fillprototype(libsvm.svm_load_model, POINTER(svm_model), [c_char_p])

fillprototype(libsvm.svm_get_svm_type, c_int, [POINTER(svm_model)])
fillprototype(libsvm.svm_get_nr_class, c_int, [POINTER(svm_model)])
fillprototype(libsvm.svm_get_labels, None, [POINTER(svm_model), POINTER(c_int)])
fillprototype(libsvm.svm_get_svr_probability, c_double, [POINTER(svm_model)])

fillprototype(libsvm.svm_predict_values, c_double, [POINTER(svm_model), POINTER(svm_node), POINTER(c_double)])
fillprototype(libsvm.svm_predict, c_double, [POINTER(svm_model), POINTER(svm_node)])
fillprototype(libsvm.svm_predict_probability, c_double, [POINTER(svm_model), POINTER(svm_node), POINTER(c_double)])

fillprototype(libsvm.svm_destroy_model, None, [POINTER(svm_model)])
fillprototype(libsvm.svm_destroy_param, None, [POINTER(svm_parameter)])

fillprototype(libsvm.svm_check_parameter, c_char_p, [POINTER(svm_problem), POINTER(svm_parameter)])
fillprototype(libsvm.svm_check_probability_model, c_int, [POINTER(svm_model)])
fillprototype(libsvm.svm_set_print_string_function, None, [PRINT_STRING_FUN])
