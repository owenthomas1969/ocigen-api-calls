var fs = require('fs');
var https = require('https');
var os = require('os');
var httpSignature = require('http-signature');
var jsSHA = require("jssha");


// TODO: update these values to your own
var tenancyId = "ocid1.tenancy.oc1..aaaaaaaafj37mytx22oquorcznlfuh77cd45int7tt7fo27tuejsfqbybzrq";
var authUserId = "ocid1.user.oc1..aaaaaaaa3ewngrendidtzfq6i3sdudpjsmfxhby245qqpohlgvaosrgbjwda";
var compartmentId = 'ocid1.compartment.oc1..aaaaaaaalazznp6hiadthdis7g4tpimghynegafve654xfjhvtslpo6y3pdq';

//No password
var keyFingerprint = "8c:67:d3:38:f4:7b:4b:8d:cf:86:40:84:3a:24:40:ad";
var privateKeyPath = "oci_api_key_no_pass.pem";

// var keyFingerprint = "ac:2b:6e:db:d3:22:73:91:c2:a0:d0:d5:f4:39:a8:5d";
// var privateKeyPath = "OCI_test.pem";


// console.us-phoenix-1.oraclecloud.com
var identityDomain = "identity.us-phoenix-1.oraclecloud.com";
var coreServicesDomain = "iaas.us-phoenix-1.oraclecloud.com";


// if (privateKeyPath.indexOf("~/") === 0) {
//     privateKeyPath = privateKeyPath.replace("~", os.homedir())
// }
var privateKey = fs.readFileSync(privateKeyPath, 'ascii');

// generates a function to handle the https.request response object
function handleRequest(callback) {

    return function (response) {

        var responseBody = "";

        response.on('data', function (chunk) {
            responseBody += chunk;
        });

        response.on('end', function () {
            callback(JSON.parse(responseBody));
        });
    }
}

function sign(request, options) {


    var apiKeyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;

    var headersToSign = [
        "host",
        "date",
        "(request-target)"
    ];

    var methodsThatRequireExtraHeaders = ["POST", "PUT"];

    if (methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {

        console.log("Headers require extra");

        options.body = options.body || "";

        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(options.body);

        request.setHeader("Content-Length", options.body.length);
        request.setHeader("x-content-sha256", shaObj.getHash('B64'));

        headersToSign = headersToSign.concat([
            "content-type",
            "content-length",
            "x-content-sha256"
        ]);
    }

    httpSignature.sign(request, {
        key: options.privateKey,
        keyId: apiKeyId,
        headers: headersToSign
    });

    var newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
    request.setHeader("Authorization", newAuthHeaderValue);
}

module.exports.sign = sign;
module.exports.handleRequest = handleRequest;