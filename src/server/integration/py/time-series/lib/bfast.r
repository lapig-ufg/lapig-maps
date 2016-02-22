#!/usr/bin/Rscript

library(bfast)

# reads the arguments passed through the command-line, NOT evaluating them.
# 'numArgs' is the maximum number of arguments allowed for your script.
# 'must' is a logical value indicating if your script requires an argument to work properly, 
# i.e.: If no args were passed, the program will terminate.
getArgs = function(numArgs, must=FALSE){
    args = commandArgs(TRUE)

    argsPassed = length(args)

    if( (argsPassed > numArgs) || (argsPassed == 0 && isTRUE(must)) ){
        cat("Number of arguments is invalid.\n Abort!\n\nTry '--help'.")
        quit()
    }
    
    return(args)
}

# gets the arguments
# Must be in the following order: h, season, start_date, end_date, timeseriesData
args = getArgs(5, must=TRUE)

h = as.numeric(args[1])
season = as.character(args[2])

args[5] = paste0("c", chartr("[]", "()", args[5]))
tsData = eval(parse(text=args[5]))

#Verifica se existe mais de uma data
# if(nchar(args[3]) >= 11){# || ifelse(grepl(' ', args[3]), TRUE, FALSE)){
#     print("Erro: Existem mais de uma data inicial ou final.")
#     quit()
# }

start_date = as.Date(args[3])
end_date = if(args[4] == "NOW") Sys.Date() else as.Date(args[4])

startYear = as.numeric(format(start_date, "%Y"))
endYear = as.numeric(format(end_date, "%Y"))

endYears = (startYear+1):endYear
endYears = as.Date(paste0(endYears, "-01-01"))
startYears = c(start_date, endYears[-length(endYears)])

dates = Map(seq, startYears, endYears, 16)
dates = do.call("c", dates)

endYearDt = as.Date(endYears[length(endYears)])
dates = c(dates, seq(from=endYearDt, to=end_date, by=16))

if(length(tsData) < length(dates)){
	dates = dates[1:length(tsData)]
}

Yt = bfastts(tsData, dates, type="16-day")
fit = bfast(Yt, h=h, season=season, max.iter=1)

cat(fit$output[[1]]$Tt)

