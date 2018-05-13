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



function updateRouteTable(compartmentId, igwId, rtId, callback) {
    
    var body = JSON.stringify({
        routeRules: [{
            "cidrBlock": "0.0.0.0/16",
            "networkEntityId": "ocid1.internetgateway.oc1.phx.aaaaaaaa5cmyizas3j5cpwzjflnh67o74oervcynbkf224flxm5neo6nz4ya"
        }]
    });

    var options = {
        host: coreServicesDomain,
        compartmentId: compartmentId,
        path: '/20160918/routeTables/' + rtId,
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
        }
    };
    console.log('options : ' + options);
    console.log('body : ' + body);
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

function listRouteTables(compartmentId, vcnId, callback) {

        // var body = JSON.stringify({
        //     compartmentId: compartmentId
        // });
    
        var options = {
            host: coreServicesDomain,
            compartmentId: compartmentId,
            path: '/20160918/routeTables?' + 'compartmentId=' + encodeURIComponent(compartmentId) + '&vcnId=' + vcnId,
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

module.exports.updateRouteTable = updateRouteTable;
module.exports.listRouteTables = listRouteTables;
