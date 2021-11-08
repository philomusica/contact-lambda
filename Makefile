.PHONY: clean build deploy

clean:
	rm -rf node_modules

build:
	npm install --only=production

deploy: clean build
	zip -r function.zip index.js node_modules
	aws lambda update-function-code --function-name $(ARN) --zip-file fileb://function.zip
