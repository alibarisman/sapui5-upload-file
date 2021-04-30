sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/odata/v2/ODataModel"
], function (JSONModel, Device, ODataModel) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createODataModel: function(){
			var oDataModel = new ODataModel("/sap/opu/odata/sap/ZUPLOAD_FILE_SRV/");
			return oDataModel;
		},
		
		createDataModel: function(){
			var oModel = new JSONModel({
				ZFILESet: []
			});
			
			return oModel;
		}
		

	};
});