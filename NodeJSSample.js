
/*
    Version 1.0.1
    Before running this example, install necessary dependencies by running:
    npm install http-signature jssha
*/

var fs = require('fs');
var https = require('https');
var os = require('os');
var httpSignature = require('http-signature');
var jsSHA = require("jssha");
var vcn = require('./vcn');
var igw = require('./internetGateway');
var rt = require('./route_table');

//Tenancy OCID		    ocid1.tenancy.oc1..aaaaaaaafj37mytx22oquorcznlfuh77cd45int7tt7fo27tuejsfqbybzrq
//Users OCID			ocid1.user.oc1..aaaaaaaa3ewngrendidtzfq6i3sdudpjsmfxhby245qqpohlgvaosrgbjwda

// TODO: update these values to your own
var tenancyId = "ocid1.tenancy.oc1..aaaaaaaafj37mytx22oquorcznlfuh77cd45int7tt7fo27tuejsfqbybzrq";
var authUserId = "ocid1.user.oc1..aaaaaaaa3ewngrendidtzfq6i3sdudpjsmfxhby245qqpohlgvaosrgbjwda";
var compartmentId = 'ocid1.compartment.oc1..aaaaaaaalazznp6hiadthdis7g4tpimghynegafve654xfjhvtslpo6y3pdq';
                     

//
// var keyFingerprint = "bf:80:37:b6:f3:8b:bc:a6:00:06:bb:b3:d6:41:b4:5d";
// var privateKeyPath = "~/.oci/oci_api_key.pem";

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


// gets the OCI user with the specified id
function getUser(userId, callback) {

    var options = {
        host: identityDomain,
        path: "/20160918/users/" + encodeURIComponent(userId),
    };

    var request = https.request(options, handleRequest(callback));

    sign(request, {
        privateKey: privateKey,
        keyFingerprint: keyFingerprint,
        tenancyId: tenancyId,
        userId: authUserId
    });

    request.end();
};


// 
function getRouteTables(compartmentId, vcnId) {
    return new Promise((resolve, reject) => {
       rt.listRouteTables(compartmentId, vcnId, function (data) {
           resolve(data); 
       });
    });
}

// 
function getInternetGateways(compartmentId, vcnId) {
    return new Promise((resolve, reject) => {
        igw.listGateways(compartmentId, vcnId, function (data) {
        resolve(data); 
       });
    });
}
// 
function updateRouteTable(compartmentId, igwId, rtId) {
    return new Promise((resolve, reject) => {
       rt.updateRouteTable(compartmentId, igw, rtId, function (data) {
           resolve(data); 
       });
    });
}

function getVCNList(compartmentId){
    return new Promise((resolve, reject) => {
        vcn.listVCN(compartmentId, "FS-Test-VCN", "172.16.0.0/16", function (data) {
            resolve(data); 
        });
    });
}


async function runThisCode() {

    // TODO: replace this with a compartment you have access to
    var compartmentIdToCreateVcnIn = compartmentId;
    var vcnID = 1;


    //   vcn.createVCN(compartmentIdToCreateVcnIn, "FS-Test-VCN_3", "172.16.0.0/16", function (data) {
    //      console.log(data);
    //  });

    //removeVCN.deleteVCN('ocid1.vcn.oc1.phx.aaaaaaaa7oud6675tzib4j2ko2f5l4yb56sfcri6wgkdl73nrpzdzjecmlua', function (data) {
    //    console.log('VCN Has been deleted');
    //});

    // igw.createGateway(compartmentIdToCreateVcnIn, 'MyInternetGateway','ocid1.vcn.oc1.phx.aaaaaaaafugcftgh7ot4yma6fftw2fqmo2bzltjdnyhxl4rdued5xognh35a', function(data) {
    //     console.log('Gateway created');
    //     console.log(data);
    // });
try{
    console.log('Get VCN List');
    const vcnList = await getVCNList(compartmentId);
    console.log(vcnList);

    var vcnId = vcnList[0].id;

    console.log('List Internet Gateways');
    const igwList = await getInternetGateways(compartmentId, vcnId);
    console.log(igwList);

    var igwId = igwList[0].id;

    console.log('Get Route Tables');
    const routeTables = await getRouteTables(compartmentId, vcnId);
    console.log(routeTables);

    var rtId = routeTables[0].id;

    console.log('Update Route Table');
    const routeTable = await updateRouteTable(compartmentId, igwId, rtId);
    console.log(routeTable);
} catch(err){
    console.log('Error', err.message);
}
}

runThisCode();