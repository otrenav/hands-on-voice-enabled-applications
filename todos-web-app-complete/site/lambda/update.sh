if node ./custom/index.js
then
    cd ./custom
    zip ../index.zip -r *
    cd ..
    aws lambda update-function-code \
        --function-name ask-custom-ToDos-Web-App-site \
        --zip-file fileb://index.zip
    rm index.zip
    echo ""
    echo "DONE."
    echo ""
else
    echo ""
    echo "ERROR: Check your index.js file"
    echo ""
fi
