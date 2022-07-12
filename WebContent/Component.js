(function() {
	"use strict";

	/* global jQuery, sap */
	jQuery.sap.declare("ces.ushell.UIPluginAddFooter.Component");

	var thisObject = null;
	var _config = null;
	var _sComponentName = "ces.ushell.UIPluginAddFooter";
	var _startDateTime;
	var _sysDateTime = null;
	var _sysTimeZone = null;
	var _srvRefreshInterval = 15;
	var _lastRefresh = null;
	var _resetStartTime;
	var _resBundle=null;
	
	var _slackDialog=null;

	var _isPhone = null;
	var _oData;
	var _oModel;

	var _idleWarningThreshold = 20;
	var _idleTimeOut = 30;
	var _dispWarning = false;

	Date.prototype.stdTimezoneOffset = function() {
	    var jan = new Date(this.getFullYear(), 0, 1);
	    var jul = new Date(this.getFullYear(), 6, 1);
	    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
	}

	Date.prototype.dst = function() {
	    return this.getTimezoneOffset() < this.stdTimezoneOffset();
	}

	$(document).ready(function() {
		// Zero the idle timer on mouse movement.
		$(this).click(function(e) {
			_resetStartTime = true;
			_processIdleTime(false);
		});
		$(this).keypress(function(e) {
			_resetStartTime = true;
			_processIdleTime(false);
		});
		//window.onbeforeunload = function (event) {
		//	sap.m.MessageBox.warning("Please wait while we clearing up");
		//	_logoffTempo();
		//	var _i=0;
		//	while(_i<1000000){_i++;};
		//    return 'are you sure?';
		//};

//		setTimeout(function(handler) {
//			//		_self._replacePhoto();
//			}, 0, this);
		
//		window.onError = function(message, source, lineno, colno, error) {
//			  alert('oops');
//			}
		
	});

	
	(function() {
	    'use strict';
	    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.userpref.SearchPrefsModel');
//	    jQuery.sap.registerModulePath('sap.ushell.renderers.fiori2.search.SearchModel', 'sap/ushell/renderers/fiori2/search/SearchModel');
//	    jQuery.sap.registerModulePath('sap.ushell.renderers.fiori2.search.SearchConfiguration', 'sap/ushell/renderers/fiori2/search/SearchConfiguration');
	
//	    jQuery.sap.require('sap/ui/model/json/JSONModel');
//	    jQuery.sap.require('sap/ushell/renderers/fiori2/search/SearchModel');
//	    jQuery.sap.require('sap/ushell/renderers/fiori2/search/SearchConfiguration');
//	    jQuery.sap.require('sap/ushell/renderers/fiori2/search/SearchHelper');

/*	    
	    sap.ui.require([
		    'sap/ui/model/json/JSONModel',
		    'sap/ushell/renderers/fiori2/search/SearchModel',
		    'sap/ushell/renderers/fiori2/search/SearchConfiguration',
		    'sap/ushell/renderers/fiori2/search/SearchHelper',
		    'sap/ushell/renderers/fiori2/search/userpref/SearchPrefsModel'
		], function (JSONModel, SearchModel, SearchConfiguration, SearchHelper, SearchPrefsModel) {
		    "use strict";

		    return SearchPrefsModel.extend({

		        asyncInit: function () {

//		            // check cache
//		            var that = this;
//		            if (that.initializedDeferred) {
//		                return that.initializedDeferred;
//		            }
//
//		            // get search model and call init
//		            that.searchModel = sap.ushell.renderers.fiori2.search.getModelSingleton();
//		            that.initializedDeferred = that.searchModel.initBusinessObjSearch().then(function () {
//		                if (!that.searchModel.config.searchBusinessObjects) {
//		                    that.setProperty('/searchPrefsActive', false);
//		                    that.setProperty('/personalizedSearch', false);
//		                    that.setProperty('/resetButtonWasClicked', false);
//		                    return undefined;
//		                }
//		                var sinaNext = that.searchModel.sinaNext;
//		                return SearchHelper.convertPromiseTojQueryDeferred(sinaNext.getConfigurationAsync({
//		                    forceReload: true
//		                })).then(function (configuration) {
//		                    that.configuration = configuration;
//		                    that.setProperty('/searchPrefsActive', configuration.isPersonalizedSearchEditable);
//		                    that.setProperty('/personalizedSearch', configuration.personalizedSearch);
//		                    that.setProperty('/resetButtonWasClicked', false);
//		                });
//		            });
//		            return that.initializedDeferred;

   	        }

		    })

		});
*/		
	
	}());
	
	
	function _logoff() {
			$.ajax({
				type : "GET",
				async: false,
				url : _config.logoffURL, // Clear SSO cookies:
													// SAP Provided service
													// to do that
			})
			.done(function(data) {
				window.location.replace(_config.logoffURL);
			});
	};

	function _processIdleTime(prefreshSysData) {
		// Calculate idle time span
		var currDateTime = Date.now();
		var idleTimeSpan;
		var _self = this;

		idleTimeSpan = _getTimeSpanMinutes(currDateTime, _startDateTime);

		// Reset idle time if activity
		if (_resetStartTime && idleTimeSpan < _idleTimeOut) {
			_startDateTime = Date.now();
			_resetStartTime = false;
			idleTimeSpan = 0;
		}

		// Display warning or redirect to time out page
		var refreshSysData = prefreshSysData;
		var _resBundle = thisObject.getModel("i18n").getResourceBundle("zcesflp.i18n.i18n");
		
		if (idleTimeSpan >= _idleWarningThreshold && idleTimeSpan < _idleTimeOut) { 
			thisObject._displayWarningMessage(_resBundle.getText('logoffWarningMessage'));
		} else if (idleTimeSpan >= _idleTimeOut) {
			refreshSysData = false;
			$.ajax({
				type : "GET",
				url : _config.logoffURL, // Clear SSO cookies:
													// SAP Provided service
													// to do that
			}).done(function(data) {
				window.location.replace(_config.logoffURL);
			});
		}

		// Refresh data from server
		if (refreshSysData & !_isPhone) {
			thisObject._refreshSysData();
		}
	}
	;

	function _getTimeSpanMinutes(dtValue1, dtValue2) {
		var timeDiff;

		if (dtValue1 && dtValue2) {
			timeDiff = Math.abs(dtValue1 - dtValue2);
			var minutes = parseInt(timeDiff / (1000 * 60));
			return minutes;
		} else {
			return 0;
		}
	}
	;

	// new Component
	sap.ui.define(["sap/ui/core/UIComponent","sap/m/MessageBox","sap/m/Button","sap/m/ActionSheet"],
					function(UIComponent, msgBox, Button, ActionSheet) {
						"use strict";
						return UIComponent.extend("ces.ushell.UIPluginAddFooter.Component",
										{
											metadata : {
												manifest : "json"
											},

//											metadata : {
//												//version : "@version@",
//												version : "2.0",
//												library : "sap.ushell.demo.UIPluginAddFooter"
//											},

											init : function() {
												//sap.ui.getCore().getConfiguration().setLanguage( "pl" );
												sap.ui.getCore().getConfiguration().getLanguage();
												thisObject = this;
												_config = thisObject.getMetadata().getManifestEntry("/sap.ui5/config");
												_resBundle = thisObject.getModel("i18n").getResourceBundle("zcesflp.i18n.i18n");
												_isPhone = sap.ui.Device.system.phone;
												_startDateTime = Date.now();
												_resetStartTime = false;
												 
												var sApiUrl = _config.serviceConfig.apiSrvUrl;
												var oConfig = {
														metadataUrlParams : {},
														json : true,
														defaultBindingMode : "OneWay",
														defaultCountMode : "Inline",
														useBatch : false
													};
													_oModel = new sap.ui.model.odata.v2.ODataModel(
															sApiUrl, oConfig);

												//var p=sap.ushell.renderers.fiori2.search.userpref;
												//p.SearchPrefs.model.setProperty('/personalizedSearch',false);
												//p.SearchPrefs.model.setProperty('/searchPrefsActive',false);
												//var sm=sap.ushell.renderers.fiori2.search.getModelSingleton();
												//sm.config.searchBusinessObjects=false;
												
												//p.SearchPrefsModel.prototype.asyncInit= function(){ debugger; alert('proto');}
												
												var renderer = sap.ushell.Container.getRenderer("fiori2");
												renderer.getComponentData().config.enablePersonalization = true;
												renderer.addHeaderEndItem("sap.m.Button", {
													id: "headerEnd",
													icon: "sap-icon://world",
													text: 'Language',
												//	type: "Transparent",
													press: this._showLanguageMenu.bind(this)
												}, true, false);

												renderer.addHeaderEndItem("sap.m.Button", {
													id: "headerEnd22",
													icon: "sap-icon://sys-help",
													text: 'Documentation',
												//	type: "Transparent",
													press: this._showHelpMenu.bind(this)
												}, true, false);

												renderer.addHeaderEndItem("sap.m.Button", {
													id: "headerEnd23",
													icon: "sap-icon://discussion-2",
													text: 'Slack',
												//	type: "Transparent",
													press: this._showSlack.bind(this)
												}, true, false);

												this._readSysData();
											},
											
											onAfterRendering : function() {
												var ww=sap.ushell.renderers.fiori2.search.getModelSingleton();
												ww.initBusinessObjSearch();

											},

											_readSysData : function() {
//												_oModel
//												.read(
//														"/FLPUserDataSet('')",
//														{
//															async : true,
//															success : function(oData,response) {
//																thisObject._renderLaunchpad(oData);
//															},
//															error : function(oError) {
//															},
//														});
												
												thisObject._renderLaunchpad();
											},

											_refreshSysData : function() {
												// debugger;
												var currDateTime = Date.now();
												var svrRefreshTimeSpan;
												var refreshFromServer = false;

												svrRefreshTimeSpan = _getTimeSpanMinutes(currDateTime,_lastRefresh);
												
												if (svrRefreshTimeSpan >= _srvRefreshInterval) {
													refreshFromServer = true;
													_sysDateTime = null;
												}

												var oTextSysTime = sap.ui.getCore().byId('txtSysTime');

												if (refreshFromServer) {
													oTextSysTime.setText(thisObject._renderDateTime());
												} else {
													oTextSysTime.setText(thisObject._renderDateTime(null));
												}
											},
											_renderLaunchpad : function() {
												var _self = this;
												
												this._getRenderer()
														.fail(
																function(sErrorMessage) {
																	jQuery.sap.log.error(sErrorMessage,undefined,_sComponentName);
																})
														.done(
																function(oRenderer) {
																	
																//	setTimeout(function(handler) {
																//		_self._replacePhoto();
																//	}, 0, this);
																	var sRendererExtMethod = "setFooter";

																	var oTextLMPI = new sap.m.Text("txtLMPI",
																			{
																				wrapping : true
																			})
																	.setText(_resBundle.getText('footerMsg'))
																	.addStyleClass("lmcesFooter");
																	var oTextSysTime = new sap.m.Text(
																			"txtSysTime",
																			{
																				text : thisObject._renderDateTime(),
																				wrapping : true,
																				visible : !_isPhone
																			}).addStyleClass("lmcesFooter");
																	var oBar = new sap.m.Bar(
																			'xLMFooter',
																			{
																				contentLeft : oTextSysTime,
																				contentMiddle : oTextLMPI
																			});

																	if (typeof oRenderer[sRendererExtMethod] === "function") {
																		oRenderer[sRendererExtMethod]
																				(oBar);

																		setInterval(
																				function() {
																					_processIdleTime(true);
																				},
																				59999);
																	} else {
																		jQuery.sap.log.error(_resBundle.getText(errMsg1,[sRendererExtMethod]),
																						undefined,
																						_sComponentName);
																		return;
																	}
																});
											},
											
											_replacePhoto: function(){
//												var imageSource = this.getMetadata().getConfig().serviceConfig.imageUrl+"/service.svc/s/GetPersonaPhoto?email=" + sap.ushell.Container.getService("UserInfo").getUser().getEmail();
												var imageSource = _config.imageServiceURL + sap.ushell.Container.getService("UserInfo").getUser().getEmail();
												//var imageSource = 'https://auth.p.external.lmco.com/idp/prp.wsf?wa=wsignin1.0&wtrealm=https%3a%2f%2fowa.external.lmco.com%2fowa%2f&wctx=rm%3d0%26id%3dpassive%26ru%3d%252fowa%252fservice.svc%252fs%252fGetPersonaPhoto%253femail%253d'+sap.ushell.Container.getService("UserInfo").getUser().getEmail()+'&size=HR96x96';
												//setTimeout(function(handler) {
												//	$("#meAreaHeaderButton").html( "<img style='max-width: 100%; height:auto;' src=" + imageSource + ">" );;
												//}, 0, this);

//												$.ajax({
//												    type: "GET",
//												    url: imageSource,
//												    dataType: "image/gif",
//												    success: function(img) {
//												     // i = new Image();
//												     // i.src = img;
//												     // $(this).append(i);
//												    	sap.ui.getCore().byId("meAreaHeaderButton").setIcon(imageSource);
//												    },
//												    error: function(error, txtStatus) {
//												      console.log(txtStatus);
//												      console.log('error');
//												      sap.ui.getCore().byId("meAreaHeaderButton").setIcon(imageSource);
//												    }
//												  });
												sap.ui.getCore().byId("meAreaHeaderButton").setIcon(imageSource);
//												var biggerImage = imageSource + "&UA=0&size=HR96x96";
												var biggerImage = imageSource + "&size=HR96x96";
												sap.ushell.Container.getService("UserInfo").getUser().setImage(biggerImage);
	
											},

											/**
											 * Returns the shell renderer
											 * instance in a reliable way, i.e.
											 * independent from the
											 * initialization time of the
											 * plug-in. This means that the
											 * current renderer is returned
											 * immediately, if it is already
											 * created (plug-in is loaded after
											 * renderer creation) or it listens
											 * to the
											 * &quot;rendererCreated&quot; event
											 * (plug-in is loaded before the
											 * renderer is created).
											 * 
											 * @returns {object} a jQuery
											 *          promise, resolved with
											 *          the renderer instance,
											 *          or rejected with an
											 *          error message.
											 */
											_getRenderer : function() {
												var oDeferred = new jQuery.Deferred(), oShellContainer, oRenderer;

												thisObject._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
												if (!thisObject._oShellContainer) {
													oDeferred.reject(_resBundle.getText(errMsg2));
												} else {
													oRenderer = thisObject._oShellContainer.getRenderer();
													if (oRenderer) {
														oDeferred.resolve(oRenderer);
													} else {
														thisObject._onRendererCreated = function(oEvent) {
															oRenderer = oEvent.getParameter("renderer");
															if (oRenderer) {
																oDeferred.resolve(oRenderer);
															} else {
																oDeferred.reject(_resBundle.getText(errMsg2));
															}
														};
														thisObject._oShellContainer.attachRendererCreatedEvent(thisObject._onRendererCreated);
													}
												}

												return oDeferred.promise();
											},

											_renderDateTime : function(dateTimeValue, timezone) {
												
												var _dateval = (dateTimeValue) ? dateTimeValue : new Date();
												var _tzval = (timezone) ? timezone : 'ET';
												
												if (_sysDateTime == null) {
													_sysDateTime = _dateval;
												} else {
													_sysDateTime.setMinutes(_sysDateTime.getMinutes() + 1);
												}

												_sysTimeZone = _tzval || _sysTimeZone;
												return thisObject._formatDate(_sysDateTime,_sysTimeZone);
											},

											_formatDate : function(value,timezone) {
												if (value) {
													return value.toLocaleString(_config.dateFormat, {timeZone: _config.timezone}) + ' ' + timezone;
												} else {
													return value;
												}
											},
											_displayWarningMessage : function(message) {
												var bCompact = false;

												if (!_dispWarning) {
													
													_dispWarning = true;

													if (sap.ui.Device.support.touch === true) {
														bCompact = true;
													}

													msgBox.warning(
																	message,
																	{
																		styleClass : bCompact ? "sapUiSizeCompact" : "",
																		onClose : function() {
																			_dispWarning = false;
																		}
																	});
												}
											},

											exit : function() {
												if (this._oShellContainer && this._onRendererCreated) {
													this._oShellContainer.detachRendererCreatedEvent(this._onRendererCreated);
												}
											},

											_showHelpMenu: function(oEvent) {
												var oButton = (oEvent.getSource().isActive())?oEvent.getSource():sap.ui.getCore().byId("endItemsOverflowBtn");
												if (!this._oHelpMenu) {
													this._oHelpMenu = this._createHelpMenu();
												} else {
													this._oHelpMenu.close();
													this._oHelpMenu=null;
												}
												// var oDock = sap.ui.core.Popup.Dock;
												// this._oMenu.open(false, oButton, oDock.BeginTop, oDock.BeginBottom, oButton);
												this._oHelpMenu.openBy(oButton);
											},

											_showSlack: function(oEvent) {
												var oButton = (oEvent.getSource().isActive())?oEvent.getSource():sap.ui.getCore().byId("endItemsOverflowBtn");
												if (!this._oSlackView) {
													this._oSlackCursor = null;
													this._oSlackView = this._createSlackView();
													this._oSlackView.openBy(oButton);
												} else {
													if(this._oSlackView.oPopup.getOpenState()===sap.ui.core.OpenState.OPEN){
														sap.ui.getCore().byId("xSlLst").destroy();
														//sap.ui.getCore().byId("xSlack").destroy();
														this._oSlackView.close();
														this._oSlackCursor = null;
														this._oSlackView=null;														
													} else {
														this._oSlackView.openBy(oButton);
													}
												}
												// var oDock = sap.ui.core.Popup.Dock;
												// this._oMenu.open(false, oButton, oDock.BeginTop, oDock.BeginBottom, oButton);
												
											},

											
											_showLanguageMenu: function(oEvent) {
												var oButton = (oEvent.getSource().isActive())?oEvent.getSource():sap.ui.getCore().byId("endItemsOverflowBtn");
												if (!this._oMenu) {
													this._oMenu = this._createPopoverMenu();
												} else {
													this._oMenu.close();
													this._oMenu=null;
												}
												// var oDock = sap.ui.core.Popup.Dock;
												// this._oMenu.open(false, oButton, oDock.BeginTop, oDock.BeginBottom, oButton);
												this._oMenu.openBy(oButton);
											},

											_createHelpMenu: function() {
												var oHelpMenu = new sap.m.Popover({
													showHeader: false,
													placement: "Bottom",
													content: [
														new sap.m.ActionListItem({
															text: "CES Knowledge Library",
															press: function() {
																window.open("https://coea0enp.us.lmco.com:8443/ENPmanager/pub/lmcrmscesfinmaonly/index.html?library=library.txt&show=group%21GR_6F5DE69A1C2277B9", "_blank");
															}
														}),
									//					new sap.m.ActionListItem({
									//						text: "CES SAP Reporting Tools",
									//						press: function() {
									//							window.open("https://coea0enp.us.lmco.com:8443/ENPmanager/pub/lmcrmscesfinmaonly/index.html?library=library.txt&show=group!GR_909559A888C7A495", "_blank");
									//						}
									//					}),
														new sap.m.ActionListItem({
															text: "CES Knowledge Library TEMPO",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.67116", "_blank");
															}
														}),
														new sap.m.ActionListItem({
															text: "CES Knowledge Library CATS Time",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.56440?mode=EU", "_blank");
															}
														}),														
														new sap.m.ActionListItem({
															text: "CES Legacy Library (Finance)",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.56447?mode=EU", "_blank");
															}
														}),
														new sap.m.ActionListItem({
															text: "CES Legacy Library (Common Support)",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.56439?mode=EU", "_blank");
															}
														}),
														new sap.m.ActionListItem({
															text: "CES Legacy Library (Operations)",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.56448?mode=EU", "_blank");
															}
														}),
														new sap.m.ActionListItem({
															text: "Standard Overhead Codes",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.83973?mode=EU", "_blank");
															}
														}),
														new sap.m.ActionListItem({
															text: "Additional References",
															press: function() {
																window.open("http://balancia.us.lmco.com/gm/folder-1.11.83975?mode=EU", "_blank");
															}
														}),
														new sap.m.ActionListItem({
															text: "Submit Support Ticket",
															press: function() {
																window.open("https://servicecentral.external.lmco.com/service_central_portal?id=sc_cat_item&sys_id=a91ecbd81bec9850c4b8a71de54bcb89", "_blank");
															}
														}),
														
														
														
														
													]
												});
												return oHelpMenu;
											},

											_createSlackView: function() {
												var oFeedInp = new sap.m.FeedInput({
													post: function(oEvent){
														_oModel
														.callFunction("/PostMessage", {
															urlParameters : {'ChannelId':_config.serviceConfig.apiChannel, 'Text': oEvent.getParameter('value')},
															success : function(oData, response) {
																//_promise.resolve(oData, response);
															},
															error : function(oError) {
																//self.processErrorMessages(oError);
																//_promise.reject(oError);
															},
														});

													},
													icon: "/sap/bc/ui5_ui5/sap/zcesflp/images/slack-logo.png",
													class:"sapUiSmallMarginTopBottom"
												});
												var oList = new sap.m.List('xSlLst',{noDataText: 'Loading...'});
												var oChannelList = new sap.m.Popover('xSlack',{
													showHeader: false,
													contentWidth: '35%',
													contentMinWidth: '200px',
													placement: "Bottom",
													content: [oFeedInp,oList]
												});
												var _url = "/xdataSet(channel_id='"+_config.serviceConfig.apiChannel+"',cursor='"+((this._oSlackCursor)?this._oSlackCursor:"")+"')";
												var _self = this;
												
												oChannelList.setBusy(true);

												_oModel
												.read( _url,														
														{
															async : true,
															success : function(oData,response) {
																var _stream = (oData.payload)?JSON.parse(oData.payload):null;
																var _messages = (_stream)?_stream.messages:[] || [];
																_self._oSlackCursor = (_stream)?_stream.response_metadata.next_cursor || "" : "";
																(_messages.length >0)?true:oList.setNoDataText('Slack Communication Error. Please try again later.');
																_messages.forEach(function(message){
																	 oList.addItem(new sap.m.FeedListItem({
																		 	sender: (message.bot_profile)?message.bot_profile.name : message.user,
																			text:message.text,
																			info:message.team,
																			convertLinksToAnchorTags:"All",
																			timestamp: new Date(message.ts*1000),
																			//type:"Detail",
																			icon:(message.subtype==='channel_join')?"sap-icon://add-employee":"sap-icon://discussion",
																			wrapping:true
																			
																		//	press: function() {
																		//		window.open("http://balancia.us.lmco.com/gm/folder-1.11.56439?mode=EU", "_blank");
																		//	}
																		}));														 
																 });
																oChannelList.setBusy(false);
															},
															error : function(oError) {
															},
														});


												return oChannelList;
											},
											
											_slackRead(oCL) {
												var _self = this;
												oCL.setBusy(true);

												_oModel
												.read( _url,														
														{
															async : true,
															success : function(oData,response) {
																var _stream = JSON.parse(oData.payload);
																_self._oSlackCursor = _stream.response_metadata.next_cursor;
																_stream.messages.forEach(function(message){
																	 oList.addItem(new sap.m.FeedListItem({
																		 	sender: message.user,
																			text:message.text,
																			info:message.team,
																			convertLinksToAnchorTags:"All",
																			timestamp: new Date(message.ts*1000),
																			//type:"Detail",
																			icon:(message.subtype==='channel_join')?"sap-icon://add-employee":"sap-icon://discussion",
																			wrapping:true
																			
																		//	press: function() {
																		//		window.open("http://balancia.us.lmco.com/gm/folder-1.11.56439?mode=EU", "_blank");
																		//	}
																		}));														 
																 });
																oChannelList.setBusy(false);
															},
															error : function(oError) {
															},
														});

											},
											
											
											_createMenu: function() {
												var oMenu = new ActionSheet({
													showCancelButton: false,
													buttons: [
														new Button({
															text: "English",
															press: function() {
																window.location.search = "sap-language=EN";
															}
														}),
														new Button({
															text: "Polski",
															press: function() {
																window.location.search = "sap-language=PL";
															}
														})
													]
												});
												return oMenu;
											},
											
											_createPopoverMenu: function() {
												var _self = this;
												var oMenu = new sap.m.Popover({
													showHeader: false,
													placement: "Bottom",
													content: [
														new sap.m.List({
															items: [
																new sap.m.ActionListItem({
																	text: "English",
																	press: function(oEvent) {
																		(_self._oMenu)?_self._oMenu.close():false;
																		window.location.search = "sap-language=EN";
																		sap.ui.getCore().getConfiguration().setLanguage('en-US')
																	},
																}),
																new sap.m.ActionListItem({
																	text: "Polski",
																	press: function(oEvent) {																
																		(_self._oMenu)?_self._oMenu.close():false;
																		window.location.search = "sap-language=PL";
																		sap.ui.getCore().getConfiguration().setLanguage('pl-PL')
																	},
																})
																
															]
															
														})
													]
												});
//												.bindAggregation("buttons", {
//											    	path: 'tpo>/LanguageSet', 
////											    	filters: _filter,
//											    	template: new Button({
//														text: "{Sptxt}",
//														press: function() {
//															window.location.search = "sap-language={Langu}";
//														}
//													})
//											    });	

												return oMenu;
											},


										});
					});

	

	
})();