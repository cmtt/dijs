.PHONY: all test minify webpack

all : webpack minify

test :
	npm test

minify:
	java -jar node_modules/closurecompiler/compiler/compiler.jar --compilation_level=ADVANCED_OPTIMIZATIONS --language_in=ES6_STRICT --language_out=ES5_STRICT --formatting SINGLE_QUOTES --externs=contrib/externs.js dist/di.js > dist/di.min.js

webpack:
	node node_modules/webpack/bin/webpack.js
