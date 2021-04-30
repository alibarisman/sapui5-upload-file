sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/ODataModel",
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/UploadCollectionParameter"
], function (Controller, Filter, FilterOperator, ODataModel, MessageToast, Button, Dialog, MessageBox, List, StandardListItem,
	UploadCollectionParameter) {
	"use strict";

	var name;
	var mandt;

	var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZUPLOAD_FILE_SRV");

	return Controller.extend("com.sap.UploadImage.controller.UploadImage", {

		/*** File Uploader ***/

		handleUploadComplete: function (oEvent) {
			var oListModel = this.getOwnerComponent().getModel("Data");
			var dataList = oListModel.getData();
			var obj = {
				filename: ""
			};
			obj.filename = oEvent.getParameter("fileName");
			dataList.ZFILESet.push(obj);
			oListModel.refresh();
			MessageToast.show("Dosya yüklendi");
		},

		handleUploadPress: function () {
			var oFileUploader = this.getView().byId("fileUploader");
			if (oFileUploader.getValue() === "") {
				MessageToast.show("Lütfen dosya seçimi yapın");
			} else {
				oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "SLUG",
					value: oFileUploader.getValue()
				}));

				oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "po",
					value: "12234"
				}));

				oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "x-csrf-token",
					value: oModel.getSecurityToken()
				}));

				oFileUploader.setSendXHR(true);
				oFileUploader.upload();
			}
		},

		download: function (oEvent) {
			var ctx = oEvent.getSource().getBindingContext("Data");
			name = ctx.getObject().filename;
			mandt = 100;
			var oDataModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZUPLOAD_FILE_SRV");
			oDataModel.getData("/Data");
			oDataModel.read("/ZFILESet(Mandt='" + mandt + "',Filename='" + name + "')/$value", {
				success: function (oData, response) {
					var file = response.requestUri;
					window.open(file);
				},
				error: function () {
					MessageBox.error("Dosya indirilemedi!");
				}
			});
		},
		
		/*** Upload Collection ***/
		
		onStartUpload: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";

			if (cFiles === 0) {
				MessageToast.show("Lütfen dosya seçimi yapın");
			} else {
				oUploadCollection.upload();
				MessageToast.show("Yükleniyor " + uploadInfo);
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			this._openBusy();
		},

		onUploadComplete: function (oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function () {
				var oUploadCollection = this.byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}
				// delay the success message in order to see other messages before
				MessageToast.show("Yükleme işlemi tamamlandı");
			}.bind(this), 1000);
			
			this._closeBusy();
		},

		onChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: oModel.getSecurityToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			MessageToast.show("Seçilen dosyalar eklendi");
		},

		onSelectChange: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},
		
		_getBusyDialog: function () {
			if (!this._busy) {
				this._busy = new sap.m.BusyDialog();
			}
			return this._busy;
		},
	
		_openBusy: function () {
			this._getBusyDialog().open();
		},
	
		_closeBusy: function () {
			this._getBusyDialog().close();
		}		

	});
});