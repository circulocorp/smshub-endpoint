var express = require('express');
const bodyParser = require('body-parser');
var router = express.Router();
require('body-parser-xml')(bodyParser);
const log = require('winston');


const { combine, timestamp, label, json } = log.format;

var logger = log.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    label({ label: 'smshub' }),
    json()
  ),
  transports: [
    new log.transports.File({ filename: 'logs/smshub-endpoint.log'})
  ]
});


var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.xml());
var port = process.env.PORT || 5500;
module.exports = app.listen(port);

app.get('/', function(request, response){
	logger.info("Simple GET request", {raw:{src: request.body}, app: 'smshub'});
	response.status(200).send("{'Health': 'Ok'}");
});

app.post('/', function(req, res){
	logger.info("Receiving SMS delivery",{raw:{src: req.body}, app: 'smshub'});
	if(req.body["soapenv:Envelope"]){
	    var notify = req.body["soapenv:Envelope"]["soapenv:Body"][0]["ns1:notifySmsDeliveryReceipt"][0];
	    logger.info("Receiving SMS delivery",{raw: {src: notify}, app: 'smshub'});
	    var status = notify["ns1:deliveryStatus"][0]["deliveryStatus"][0];
	    var address = notify["ns1:deliveryStatus"][0]["address"][0];
	    var correlator = notify["ns1:correlator"][0];
	    if(status == "DeliveryImpossible"){
	    	logger.error("Receiving SMS delivery",{correlator: correlator, address: address, status: status, app: 'smshub'});
	    }else{
	    	logger.info("Receiving SMS delivery",{correlator: correlator, address: address, status: status, app: 'smshub'});
	    }
		res.status(200).send("{'Status': 'OK'}");
	}else{
		logger.error("Request Denied",{status_code: 500,app: 'smshub'});
		res.status(500).send("{'Status': 'ERROR'}");
	}
});