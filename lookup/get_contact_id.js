// Add your function in module.exports

module.exports = {

  "name":"get_contact_id",

  "label":"Get Contact Id",
	// add input data lookup will depend on for
	// eg: if auth is oauth so add access_token inside auth object
	// you can also add other input properties which are mentioned in action/trigger
	 
	"mock_input":{},
	"search": true,
  "execute": function (input, options, output){

	  const MAX_RESULTS =10;

	  var pageId = Number(input.page) || 0;
	  


	  let lookupResult={
		  results :[],
		  next_page:false,
	  }

	  let arr =[]

	  var qs = {};
	  qs["$top"] = 10;
	  var path ="https://api.insightly.com/v3.1/Contacts";
	  if (input.nextPath) {
		path = input.nextPath;
	  }

	  self.makeApiCall(null, input, "GET", path,qs).then(res => {
		  if (res && res["@odata.nextLink"]) {
			  lookupResult.next_page = true
			  lookupResult.meta = {nextPath: res["@odata.nextLink"]}
  
		  }
		  if (res && Array.isArray(res) && res.length) {
			  res.forEach(element => {
				  if (element) {
					  arr.push({
						  "id": String(element.CONTACT_ID),
					  "value": String(element.FIRST_NAME || element.CONTACT_ID)
					  })
				  }
			  });

			  // var total_length = arr.length
			  lookupResult.results = arr
			  arr=null
				  return output(null, lookupResult)
		  } 
		  else {
				return output(null, lookupResult)
			}

		}).catch(err => {
			return output((err && err.message) ? (err.message) : err, null)
		})

	  


  },
  convertJson: function (str) {
	try {
		str = (str && typeof str === "string") ? JSON.parse(str) : str;
	} catch (e) {
		return str;
	}
	return str;
},

checkJson: function (str) {
	try {
		(str && typeof str === "string") ? JSON.parse(str) : str;
	} catch (e) {
		return false;
	}
	return true;
},



  makeApiCall: function (options_par, input, method, url, qs) {
	const request = require("request")
console.log(qs);
var y= "Basic " + new Buffer(input.auth.access_token).toString("base64");
	let temp_param = {
		method: method,
		url: url,
	  //   qs: qs,
		headers: {
		  accept: 'application/json',
		 "authorization": y
		  //"authorization": "Basic "+(input.auth.access_token:,
		}
	}
	let params = (options_par) ? (options_par) : (temp_param)

	return new Promise((resolve, reject) => {

		request(params, function (error, response, body) {
			if (error) {
				reject(error)
			}
			if (self.checkJson(body)) {
				body = self.convertJson(body)
			}
			if (response.statusCode >= 200 && response.statusCode < 400) {
				resolve(body)
			} else if (response.statusCode == 403) {
				reject("You don't have the necessary permissions to access this resource. Please ensure to select relevant scopes while creating the authorization and try again.")
			} else if (response.statusCode == 401) {
				reject("Your authorization has expired. Please create a new authorization to continue. ")
			} else if (response.statusCode == 404) {
				reject("Requested resource not found. Please check the input parameters or contact our customer support if the issue persists.")
			} else if (response.statusCode == 500) {
				reject("Something went wrong at server. Please try again after some time.")
			} else if (response.statusCode == 503) {
				reject("Something went wrong. Please try again after some time.")
			} else if (response.statusCode == 504) {
				reject("The server took too long to respond. Please try again after some time.")
			} else if (response.statusCode == 400) {
				reject("Requested resource not found. Please check the input parameters or contact our customer support if the issue persists.")
			}
			else {
				if (body && body.message) {
					reject(body.message)
				} else {
					reject(body)
				}
			}
		})
	})
}

}

var self = module.exports