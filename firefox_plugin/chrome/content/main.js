
// this is the script that we inject into every page we load
var thinklink_scriptUrl = "http://berkeley.intel-research.net/rennals/thinklink.js";
var thinklink_name = "ThinkLink";

function thinklink_error(msg,e){
	var console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	console.logStringMessage(thinklink_name + ": " + msg);
	Components.utils.reportError(e);
}

var thinklink_winlister = {
	QueryInterface: function(iid){
		var ifaces = Components.interfaces;

		if(iid.equals(ifaces.nsIWebProgressListener) || 
				iid.equals(ifaces.nsISupportsWeakReference) ||
				iid.equals(ifaces.nsISupports)){
			return this;
		}else{
			throw Components.results.NS_NOINTERFACE;
		}
	},	
	
	onStateChange: function(progress, request, flags, status){
		var states = Components.interfaces.nsIWebProgressLister;	

		if((flags & states.STATE_STOP) && (flags & states.STATE_IS_WINDOW)){
			this.injectScript();
		}
		return;
	},
	
	onLocationChange: function(){return 0;};
	onProgressChange: function(){return 0;};
	onStatusChange: function(){return 0;};
	onSecurityChange: function(){return 0;};
	onLinkIconAvailable: function(){return 0;};
	
	injectScript: function(){
		var doc = content.document;
		var scripttag = doc.createElement("script");
		scripttag.src = thinklink_scriptUrl;
		scripttag.type = "text/javascript";
		try{
			doc.getElementsByTagName("head")[0].appendChild(scripttag);
		}catche(e){
			thinklink_error("could not insert script tag",e);
		}
	}
};

gBrowser.addProgressListener(mashmaker_listener,
  	Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);

