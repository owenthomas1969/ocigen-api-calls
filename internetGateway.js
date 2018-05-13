var fs = require('fs');
var https = require('https');
var os = require('os');
var httpSignature = require('http-signature');
var jsSHA = require("jssha");

var utils = require('./vcn_utils');

// TODO: update these values to your own
var tenancyId = "ocid1.tenancy.oc1..aaaaaaaafj37mytx22oquorcznlfuh77cd45int7tt7fo27tuejsfqbybzrq";
var authUserId = "ocid1.user.oc1..aaaaaaaa3ewngrendidtzfq6i3sdudpjsmfxhby245qqpohlgvaosrgbjwda";
var compartmentId = 'ocid1.compartment.oc1..aaaaaaaalazznp6hiadthdis7g4tpimghynegafve654xfjhvtslpo6y3pdq';

//No password
var keyFingerprint = "8c:67:d3:38:f4:7b:4b:8d:cf:86:40:84:3a:24:40:ad";
var privateKeyPath = "oci_api_key_no_pass.pem";

// console.us-phoenix-1.oraclecloud.com
var identityDomain = "identity.us-phoenix-1.oraclecloud.com";
var coreServicesDomain = "iaas.us-phoenix-1.oraclecloud.com";

var privateKey = fs.readFileSync(privateKeyPath, 'ascii');

// POST /20160918/internetGateways
// Host: iaas.us-phoenix-1.oraclecloud.com
// <authorization and other headers>
// {
//   "displayName" : "MyInternetGateway",
//   "compartmentId" : "ocid1.compartment.oc1..aaaaaaaayzfqeibduyox6iib3olcmdar3ugly4fmameq4h7lcdlihrvur7xq",
//   "vcnId" : "ocid1.vcn.oc1.phx.aaaaaaaamzvcg26irmlpkcmdzs33fb43lv2ej4lxshrdgpzvxsmb7zn427ma",
//   "isEnabled" : true
// }

async function createGateway(compartmentId, displayName, vcnId, callback) {

    var body = JSON.stringify({
        compartmentId: compartmentId,
        displayName: displayName,
        vcnId: vcnId,
        isEnabled: "true"
    });
console.log(body);
    var options = {
        host: coreServicesDomain,
        compartmentId: compartmentId,
        path: '/20160918/internetGateways',
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        }
    };

    var request = https.request(options, utils.handleRequest(callback));

    utils.sign(request, {
        body: body,
        privateKey: privateKey,
        keyFingerprint: keyFingerprint,
        tenancyId: tenancyId,
        userId: authUserId
    });

    request.end(body);
};

function listGateways(compartmentId, vcnId, callback) {

    // var body = JSON.stringify({
    //     compartmentId: compartmentId
    // });


    var options = {
        host: coreServicesDomain,
        compartmentId: compartmentId,
        path: '/20160918/internetGateways?' + 'compartmentId=' + encodeURIComponent(compartmentId) + '&vcnId=' + vcnId,
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    };

    var request = https.request(options, utils.handleRequest(callback));

    utils.sign(request, {
        //body: body,
        privateKey: privateKey,
        keyFingerprint: keyFingerprint,
        tenancyId: tenancyId,
        userId: authUserId
    });

    request.end();
};

module.exports.listGateways = listGateways;
module.exports.createGateway = createGateway;
