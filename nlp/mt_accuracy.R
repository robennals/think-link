### Plot distribution of number in agreement 
### for Turk runs
### jma 18 May 2009
### $Id$

ans <- read.csv("ans_63422.csv", header=TRUE)
ans.dims <- dim(ans)
trials <- ans.dims[1]/2
cmp.array <- array(t(ans), dim=c(10,2,trials)) 

## Each column compares two users on one set of data. 
match.bools <- cmp.array[,1,] == cmp.array[,2,]
match.ct <- apply(match.bools, 2, sum)
corr.rate <- mean(match.ct)/10

plot(table(match.ct)/trials
          , type='h'
          , lwd=3
          , xlim=c(0,10)
          , ylim=c(0, 0.32)
          , ylab="frequency"
          , xlab="number in agreement"
          , main="Pairwise agreement rate"
          , sub=paste("mean = ", format(corr.rate, digits=3))
     )
lines(0:10, dbinom(0:10,10, corr.rate), type= 'l', col="blue")
