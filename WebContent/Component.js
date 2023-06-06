(

	function () {
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
		var _resBundle = null;

		var _slackDialog = null;

		var _isPhone = null;
		var _oData;
		var _oModel;

		var _idleWarningThreshold = 20;
		var _idleTimeOut = 30;
		var _dispWarning = false;

		Date.prototype.stdTimezoneOffset = function () {
			var jan = new Date(this.getFullYear(), 0, 1);
			var jul = new Date(this.getFullYear(), 6, 1);
			return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
		}

		Date.prototype.dst = function () {
			return this.getTimezoneOffset() < this.stdTimezoneOffset();
		}

		$(document).ready(function () {
			// Zero the idle timer on mouse movement.
			$(this).click(function (e) {
				_resetStartTime = true;
				_processIdleTime(false);
			});
			$(this).keypress(function (e) {
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


		(function () {
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
				type: "GET",
				async: false,
				url: _config.logoffURL, // Clear SSO cookies:
				// SAP Provided service
				// to do that
			})
				.done(function (data) {
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
					type: "GET",
					url: _config.logoffURL, // Clear SSO cookies:
					// SAP Provided service
					// to do that
				}).done(function (data) {
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
		sap.ui.define(["sap/ui/core/UIComponent", "sap/m/MessageBox", "sap/m/Button", "sap/m/ActionSheet", "zcesflp/Control/CESSearch", "zcesflp/Control/CESSrcList", "sap/ui/core/routing/HashChanger", "sap/ushell/renderers/fiori2/search/SearchHelper"],
			function (UIComponent, msgBox, Button, ActionSheet, CESSearchBtn, CESSrcList, HashChanger, SearchHelper) {
				"use strict";
				return UIComponent.extend("ces.ushell.UIPluginAddFooter.Component",
					{
						metadata: {
							manifest: "json"
						},

						init: function () {
							//sap.ui.getCore().getConfiguration().setLanguage( "pl" );
							var _src = '';
							jQuery.sap.includeStyleSheet(sap.ui.resource("zcesflp", "css/lmces.css"));


							sap.ui.getCore().getConfiguration().getLanguage();
							thisObject = this;
							_config = thisObject.getMetadata().getManifestEntry("/sap.ui5/config");
							_resBundle = thisObject.getModel("i18n").getResourceBundle("zcesflp.i18n.i18n");
							_isPhone = sap.ui.Device.system.phone;
							_startDateTime = Date.now();
							_resetStartTime = false;

							var sApiUrl = _config.serviceConfig.apiSrvUrl;
							var oConfig = {
								metadataUrlParams: {},
								json: true,
								defaultBindingMode: "OneWay",
								defaultCountMode: "Inline",
								useBatch: false
							};
							_oModel = new sap.ui.model.odata.v2.ODataModel(
								sApiUrl, oConfig);

							var p = sap.ushell.renderers.fiori2.search.userpref;
							// p.SearchPrefs.model.setProperty('/personalizedSearch',false);
							// p.SearchPrefs.model.setProperty('/searchPrefsActive',false);
							// var sm=sap.ushell.renderers.fiori2.search.getModelSingleton();
							// sm.config.searchBusinessObjects=false;

							p.SearchPrefs.model.searchModel.boTopDefault = 20
							// p.SearchPrefs.model.searchModel.appDataSource.hidden = true;
							// p.SearchPrefs.model.searchModel.allDataSource.hidden = true;
							// p.SearchPrefs.model.searchModel.iSizeLimit = 10000;
							p.SearchPrefs.model.searchModel.config.searchScopeWithoutAll = true;
							p.SearchPrefs.model.searchModel.refresh(true);

							// var oo=p.SearchPrefs.model.searchModel.getDataSource();
							// oo.sina.dataSources.pop();
							// delete oo.sina.dataSourceMap.$$APPS$$;
							// p.SearchPrefs.model.searchModel.setDataSource(oo);

							sap.ushell.renderers.fiori2.search.controls.SearchButton.extend('ces.search.button', {

							});
							this._renderCustomSearchButton();

							//p.SearchPrefsModel.prototype.asyncInit= function(){ debugger; alert('proto');}

							var renderer = sap.ushell.Container.getRenderer("fiori2");
							renderer.getComponentData().config.enablePersonalization = false;

							// renderer.addHeaderItem({
							// 	icon: "sap-icon://search",
							// 	tooltip: 'CES Lookup',
							// 	text: 'CES Lookup',
							// 	press: this._showSearch.bind(this)
							// }, true);

							// var oSidePaneContentProperties = {
							// 	controlType : "sap.m.Button",
							// 	oControlProperties : {
							// 		id: "testBtn",
							// 		icon: "sap-icon://documents",
							// 		text: "Test Button"
							// 	},
							// 	bIsVisible: true,
							// 	bCurrentState: true
							// };

							// renderer.addSidePaneContent(oSidePaneContentProperties);

							// sap.ushell.Container.getRenderer("fiori2").addToolAreaItem({
							// 	id: "testButton",
							// 	icon: "sap-icon://documents",
							// 	expandable: true,
							// 	press: function (evt) {
							// 	  window.alert("Press" );
							// 	},
							// 	expand: function (evt) {
							// 	  // This function will be called on the press event of the "expand" button. The result of "expand" event in the UI must be determined by the developer
							// 	  window.alert("Expand" );
							// 	}
							//   }, true, false, ["home"]);

							// var _bb = new CESSearchBtn();

							// var oAddSubHeaderProperties = {
							// 	controlType: "sap.m.Bar",
							// 	oControlProperties: {
							// 		design: "SubHeader",
							// 		contentMiddle: [
							// 			// new sap.m.Input({
							// 			// 	type: "Text",
							// 			// 	//class : "sapUiSmallMarginBottom",
							// 			// 	value: _src,
							// 			// 	fieldWidth: "100%",
							// 			// 	//width: "40%",
							// 			// 	enabled: true,
							// 			// 	visible: true
							// 			// }),
							// 			new sap.m.Button({
							// 				// icon: "sap-icon://search",
							// 				text: ">> Click here for CES Lookup Tool <<",
							// 				// type: "Emphasized",
							// 				press: this._showSearch.bind(this)
							// 			}),
							// 			// new CESSearchBtn()
							// 		]
							// 	},
							// 	bIsVisible: true,
							// 	bCurrentState: true
							// };

							// renderer.addShellSubHeader(oAddSubHeaderProperties);

							// --- User Action is added to User Menu ------------
							// var oAddActionButtonProperties = {
							// 	controlType : "sap.m.Button",
							// 	oControlProperties : {
							// 		id: "exampleButton",
							// 		text: "Example Button",
							// 		icon: "sap-icon://refresh",
							// 		press: function () {
							// 			alert("Example Button was pressed!");
							// 		}
							// 	},
							// 	bIsVisible: true,
							// 	bCurrentState: true
							// };					
							// renderer.addUserAction(oAddActionButtonProperties);


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

							setTimeout(function (handler) {
								var _src = sap.ui.getCore().byId("sf");
								_src.mEventRegistry.press.forEach((handler) => {
									if (typeof handler.fFunction === "function") _src.detachPress(handler.fFunction);
								});
								_src.attachPress(thisObject.handleSearch);

								var _srcDom = _src.getDomRef();

								_src.addStyleClass('sapFAvatarColorAccent6');
								_src.addStyleClass('lmsearch');

								// this.oConfirmDialog = new sap.m.Dialog({
								// 	type: "Message",
								// 	state: "Information",
								// 	title: "CES Lookup Tool",
								// 	content: new sap.m.Text({ text: "Click Search icon in the toolbar for CES Lookup tool" }),
								// 	beginButton: new sap.m.Button({
								// 		type: "Emphasized",
								// 		text: "Close and do not display again",
								// 		press: function () {
								// 			this.oConfirmDialog.close();
								// 		}.bind(this)
								// 	}),
								// 	endButton: new Button({
								// 		text: "Close",
								// 		press: function () {
								// 			this.oConfirmDialog.close();
								// 		}.bind(this)
								// 	})

								// });
								// this.oConfirmDialog.open();

								// _srcDom.childNodes[0].textContent += ' Search'
							}, 0, this);





							this._readSysData();
						},

						_renderCustomSearchButton: function () {
							var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
								oShellView = oShellCtrl.getView(),
								oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {};

							var that = this;
							var bSearchEnable = (oShellConfig.enableSearch !== false);
							if (bSearchEnable) {
								var _loadSearchShellHelper = function (init) {
									if (!that._searchShellHelperDeferred) {
										that._searchShellHelperDeferred = jQuery.Deferred();
										sap.ui.require([
											"sap/ushell/renderers/fiori2/search/SearchShellHelperAndModuleLoader",
											"sap/ushell/renderers/fiori2/search/SearchShellHelper"
										], function (SearchShellHelperAndModuleLoader, searchShellHelper) {
											if (init) {
												var _mdl = sap.ushell.renderers.fiori2.search.getModelSingleton();
												var _src = _mdl.oData.dataSources;
												var _iCat = _src.findIndex(e => e.type === 'Category');
												while (_iCat !== -1) {
													_src.splice(_iCat, 1);
													_iCat = _src.findIndex(e => e.type === 'Category');
												};
												_mdl.refresh(true);
												if(!sap.ui.getCore().byId('searchFieldInShell')) {
													searchShellHelper.init();
													that.registerFocusHandler(searchShellHelper);
												}
												var _def = searchShellHelper.oSearchSelect.getItems()[0];
												searchShellHelper.oSearchSelect.setSelectedItem(_def);
												// var a = searchShellHelper.oSearchSelect.getSelectedItem();
												var c = _def.getBindingContext();
												var d = c.getObject();
												searchShellHelper.oSearchSelect.getModel().setDataSource(d, false);
												searchShellHelper.oSearchSelect.getModel().abortSuggestions();
												searchShellHelper.oSearchSelect.getModel().eventLogger.logEvent({
													type: searchShellHelper.oSearchSelect.getModel().eventLogger.DROPDOWN_SELECT_DS,
													dataSourceId: d.id
												});
												// searchShellHelper.oShellHeader.setSearchState('EXP');
												searchShellHelper.oSearchSelect.getModel().refresh(true);
												// searchShellHelper.oSearchSelect.fireEvent("change",{'selectedItem':_def},true, true);
												that._searchShellHelperDeferred.resolve(searchShellHelper);

											}

											// var a = searchShellHelper.oSearchSelect.getSelectedItem();
											// var c = a.getBindingContext();
											// var d = c.getObject();
											// searchShellHelper.oSearchSelect.getModel().setDataSource(d, false);
											// searchShellHelper.oSearchSelect.getModel().abortSuggestions();
											// searchShellHelper.oSearchSelect.getModel().eventLogger.logEvent({
											// 	type: searchShellHelper.oSearchSelect.getModel().eventLogger.DROPDOWN_SELECT_DS,
											// 	dataSourceId: d.id
											// });											

										});
									}
									return that._searchShellHelperDeferred;
								};

								// //Search Icon
								// var oSearchBtn = {
								// 	id: "ces_src",
								// 	tooltip: "CES Lookup Tool",
								// 	icon: "sap-icon://search",
								// 	ariaLabel: "CES Lookup Tool",
								// 	visible: true,
								// 	showSeparator: false,
								// 	press: function (event) {
								// 		_loadSearchShellHelper(true).done(function (searchShellHelper) {
								// 			var _mdl = searchShellHelper.oSearchSelect.getModel();
								// 			if (sap.ui.getCore().byId('searchFieldInShell') === undefined) {
								// 				_mdl.init();
								// 			} else if (searchShellHelper.oShellHeader.getSearchState() === 'COL') {
								// 				if (_mdl.getProperty('/initializingObjSearch')) {
								// 					return;
								// 				} else {
								// 					// S.hasher.reset();
								// 					_mdl.resetTop();
								// 					_mdl.setSearchBoxTerm('');
								// 					// _mdl.resetDataSource(false);
								// 					// this.resetFilterConditions(false);
								// 					_mdl.query.resetConditions();
								// 					_mdl.query.setSearchTerm('random-jgfhfdskjghrtekjhg');
								// 					_mdl.setProperty('/facets', []);
								// 					_mdl.setProperty('/results', []);
								// 					_mdl.setProperty('/appResults', []);
								// 					_mdl.setProperty('/boResults', []);
								// 					_mdl.setProperty('/origBoResults', []);
								// 					_mdl.setProperty('/count', 0);
								// 					_mdl.setProperty('/boCount', 0);
								// 					_mdl.setProperty('/appCount', 0);

								// 				}

								// 			}
								// 			searchShellHelper.setSearchState('EXP');
								// 			var t = searchShellHelper;
								// 			function E(o) {
								// 				if (o.keyCode === 27) {
								// 					o.preventDefault();
								// 					if (a.isSearchAppActive()) {
								// 						return;
								// 					}
								// 					if (t.oSearchInput) {
								// 						if (t.oSearchInput.getValue() === "") {
								// 							jQuery(document).off('keydown', E);
								// 							t.setSearchState('COL');
								// 							window.setTimeout(function () {
								// 								sap.ui.getCore().byId('sf').focus();
								// 							}, 1000);
								// 						} else if (t.oSearchInput.getValue() === " ") {
								// 							t.oSearchInput.setValue("");
								// 						}
								// 					}
								// 				}
								// 			}
								// 			jQuery(document).on('keydown', E);



								// 			// var _mdl = searchShellHelper.oSearchSelect.getModel();

								// 			// searchShellHelper.onShellSearchButtonPressed(event);
								// 		});

								// 	}
								// };

								var oAddSubHeaderProperties = {
									controlType: "sap.m.Bar",
									oControlProperties: {
										id: "CESLookupHeader",
										design: "SubHeader",
										contentMiddle: [
											// new sap.m.Input({
											// 	type: "Text",
											// 	//class : "sapUiSmallMarginBottom",
											// 	value: _src,
											// 	fieldWidth: "100%",
											// 	//width: "40%",
											// 	enabled: true,
											// 	visible: true
											// }),
											new sap.m.Button({
												// icon: "sap-icon://search",
												text: ">> Click here for CES Lookup Tool <<",
												// type: "Emphasized",
												press: function (event) {
													_loadSearchShellHelper(true).done(function (searchShellHelper) {
														var _mdl = searchShellHelper.oSearchSelect.getModel();
														if (sap.ui.getCore().byId('searchFieldInShell') === undefined) {
															_mdl.init();
														} else if (searchShellHelper.oShellHeader.getSearchState() === 'COL') {
															if (_mdl.getProperty('/initializingObjSearch')) {
																return;
															} else {
																// S.hasher.reset();
																_mdl.resetTop();
																_mdl.setSearchBoxTerm('');
																// _mdl.resetDataSource(false);
																// this.resetFilterConditions(false);
																_mdl.query.resetConditions();
																_mdl.query.setSearchTerm('random-jgfhfdskjghrtekjhg');
																_mdl.setProperty('/facets', []);
																_mdl.setProperty('/results', []);
																_mdl.setProperty('/appResults', []);
																_mdl.setProperty('/boResults', []);
																_mdl.setProperty('/origBoResults', []);
																_mdl.setProperty('/count', 0);
																_mdl.setProperty('/boCount', 0);
																_mdl.setProperty('/appCount', 0);

															}

														}
														searchShellHelper.setSearchState('EXP');
														sap.ui.getCore().byId('CESLookupHeader').setVisible(false);

														var t = searchShellHelper;
														function E(o) {
															if (o.keyCode === 27) {
																o.preventDefault();
																if (a.isSearchAppActive()) {
																	return;
																}
																if (t.oSearchInput) {
																	if (t.oSearchInput.getValue() === "") {
																		jQuery(document).off('keydown', E);
																		t.setSearchState('COL');
																		window.setTimeout(function () {
																			sap.ui.getCore().byId('sf').focus();
																		}, 1000);
																	} else if (t.oSearchInput.getValue() === " ") {
																		t.oSearchInput.setValue("");
																	}
																}
															}
														}
														jQuery(document).on('keydown', E);



														// var _mdl = searchShellHelper.oSearchSelect.getModel();

														// searchShellHelper.onShellSearchButtonPressed(event);
													});
												}
												// this.handleSearch.bind(this)
											}),
											// new CESSearchBtn()
										]
									},
									bIsVisible: true,
									bCurrentState: false
								};

								// renderer.addShellSubHeader(oAddSubHeaderProperties);


								// sap.ushell.Container.getRenderer("fiori2")
								// 	.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", oSearchBtn, true, false);

								sap.ushell.Container.getRenderer("fiori2")
									.addShellSubHeader(oAddSubHeaderProperties);
								// oShellSearchBtn.setModel(resources.i18nModel, "i18n");

								if (oShellConfig.openSearchAsDefault) {
									_loadSearchShellHelper(true).done(function (searchShellHelper) {
										searchShellHelper.setDefaultOpen(true);
									});
								}

								// track navigation
								that.oHashChanger = HashChanger.getInstance();
								that.oHashChanger.attachEvent("shellHashChanged", function (sShellHash) {
									var hashChangeInfo = sShellHash.mParameters;
									setTimeout(function () {
										sap.ui.require([
											"sap/ushell/renderers/fiori2/search/HashChangeHandler"
										], function (HashChangeHandler) {
											HashChangeHandler.handle(hashChangeInfo);
										});
									}, 6000);
								});

								// oAddSubHeaderProperties.addEventDelegate({
								// 	onsapskipforward: function (oEvent) {
								// 		oEvent.preventDefault();
								// 		jQuery("#sapUshellHeaderAccessibilityHelper").focus();
								// 	},
								// 	onsapskipback: function (oEvent) {
								// 		oEvent.preventDefault();
								// 		jQuery("#sapUshellHeaderAccessibilityHelper").focus();
								// 	},
								// 	onAfterRendering: function () {
								// 		jQuery("#sf").attr("aria-pressed", false);
								// 	}
								// });

								// oShellSearchBtn.addEventDelegate({
								// 	onsapskipforward: function (oEvent) {
								// 		oEvent.preventDefault();
								// 		jQuery("#sapUshellHeaderAccessibilityHelper").focus();
								// 	},
								// 	onsapskipback: function (oEvent) {
								// 		oEvent.preventDefault();
								// 		jQuery("#sapUshellHeaderAccessibilityHelper").focus();
								// 	},
								// 	onAfterRendering: function () {
								// 		jQuery("#sf").attr("aria-pressed", false);
								// 	}
								// });
							}

							sap.ui.getCore().getEventBus().publish("shell", "searchCompLoaded", { delay: 0 });

						},

						onAfterRendering: function () {
							var ww = sap.ushell.renderers.fiori2.search.getModelSingleton();
							ww.initBusinessObjSearch();

						},

						registerFocusHandler: function(t){
							var r = true;
							if (!r) {
								return;
							}
							var c = t.oSearchInput.getModel();
							t.oSearchInput.addEventDelegate({
								onAfterRendering: function() {
									var i = jQuery(t.oSearchInput.getDomRef()).find('input')[0];
									var $ = jQuery(i);
									$.on('focus', function(e) {
										t.log('raw_in', document.activeElement);
										if (!t.isFocusHandlerActive) {
											return;
										}
										t.setSearchState('EXP');
									});
									$.on('blur', function(e) {
										t.log('raw_out', document.activeElement);
										if (!t.isFocusHandlerActive) {
											return;
										}
										var p = t.oSearchSelect.getPicker();
										if (p && p.oPopup && p.oPopup.eOpenState === "OPENING") {
											return;
										}
										if (!SearchHelper.isSearchAppActive() && t.oSearchInput.getValue().length === 0 ) {
											t.setSearchState('COL');
											sap.ui.getCore().byId('CESLookupHeader').setVisible(true);

										} else {
											t.setSearchState('EXP_S');
										}
									});
								}
							});
							t.oSearchSelect.addEventDelegate({
								onAfterRendering: function() {
									var d = t.oSearchSelect.getDomRef();
									d = d.querySelector('#searchFieldInShell-select-hiddenSelect');
									d.addEventListener('focus', function(e) {
										t.log('raw_in_select', document.activeElement);
										if (!t.isFocusHandlerActive) {
											return;
										}
										if (t.oShellHeader.getSearchState() === 'EXP_S' && !t.isNoSearchResultsScreen()) {
											t.setSearchState('EXP_S', true);
											return;
										}
										t.setSearchState.abort();
									});
									d.addEventListener('blur', function(e) {
										t.log('raw_out_select', document.activeElement);
										if (!t.isFocusHandlerActive) {
											return;
										}
										var p = t.oSearchSelect.getPicker();
										if (p && p.oPopup && p.oPopup.eOpenState === "OPENING") {
											return;
										}
										if (!SearchHelper.isSearchAppActive() && t.oSearchInput.getValue().length === 0 ) {
											sap.ui.getCore().byId('CESLookupHeader').setVisible(true);
											t.setSearchState('COL');
										} else {
											t.setSearchState('EXP_S');
										}
									});
								}
							});
							t.oSearchButton.addEventDelegate({
								onAfterRendering: function() {
									var d = t.oSearchButton.getDomRef();
									d.addEventListener('focus', function(e) {
										t.log('raw_in_button', document.activeElement);
										if (!t.isFocusHandlerActive) {
											return;
										}
										t.setSearchState.abort();
									});
									d.addEventListener('blur', function(e) {
										t.log('raw_out_button', document.activeElement);
										if (!t.isFocusHandlerActive) {
											return;
										}
										if (!SearchHelper.isSearchAppActive() && t.oSearchInput.getValue().length === 0 ) {
											sap.ui.getCore().byId('CESLookupHeader').setVisible(true);
											t.setSearchState('COL');
										} else {
											t.setSearchState('EXP_S');
										}
									});
								}
							});
							t.enableFocusHandler(true);
				
						},

						handleSearch: function (event) {
							var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
								oShellView = oShellCtrl.getView(),
								oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {};

							var that = thisObject;
							var bSearchEnable = (oShellConfig.enableSearch !== false);
							if (bSearchEnable) {

								var _loadSearchShellHelper = function (init) {
									if (!that._searchShellHelperDeferred) {
										that._searchShellHelperDeferred = jQuery.Deferred();
										sap.ui.require([
											"sap/ushell/renderers/fiori2/search/SearchShellHelperAndModuleLoader",
											"sap/ushell/renderers/fiori2/search/SearchShellHelper"
										], function (SearchShellHelperAndModuleLoader, searchShellHelper) {
											if (init) {
												var _mdl = sap.ushell.renderers.fiori2.search.getModelSingleton();
												var _src = _mdl.oData.dataSources;
												var _iCat = _src.findIndex(e => e.type === 'Category');
												while (_iCat !== -1) {
													_src.splice(_iCat, 1);
													_iCat = _src.findIndex(e => e.type === 'Category');
												};
												_mdl.refresh(true);
												if(!sap.ui.getCore().byId('searchFieldInShell')) {
													searchShellHelper.init();
													that.registerFocusHandler(searchShellHelper);
												}
												var _def = searchShellHelper.oSearchSelect.getItems()[0];
												searchShellHelper.oSearchSelect.setSelectedItem(_def);
												var c = _def.getBindingContext();
												var d = c.getObject();
												searchShellHelper.oSearchSelect.getModel().setDataSource(d, false);
												searchShellHelper.oSearchSelect.getModel().abortSuggestions();
												searchShellHelper.oSearchSelect.getModel().eventLogger.logEvent({
													type: searchShellHelper.oSearchSelect.getModel().eventLogger.DROPDOWN_SELECT_DS,
													dataSourceId: d.id
												});
												searchShellHelper.oSearchSelect.getModel().refresh(true);
												that._searchShellHelperDeferred.resolve(searchShellHelper);
											}

										});
									}
									return that._searchShellHelperDeferred;
								};

								_loadSearchShellHelper(true).done(function (searchShellHelper) {
									var _mdl = searchShellHelper.oSearchSelect.getModel();
									if (sap.ui.getCore().byId('searchFieldInShell') === undefined) {
										_mdl.init();
									} else if (searchShellHelper.oShellHeader.getSearchState() === 'COL') {
										if (_mdl.getProperty('/initializingObjSearch')) {
											return;
										} else {
											// S.hasher.reset();
											_mdl.resetTop();
											_mdl.setSearchBoxTerm('');
											// _mdl.resetDataSource(false);
											// this.resetFilterConditions(false);
											_mdl.query.resetConditions();
											_mdl.query.setSearchTerm('random-jgfhfdskjghrtekjhg');
											_mdl.setProperty('/facets', []);
											_mdl.setProperty('/results', []);
											_mdl.setProperty('/appResults', []);
											_mdl.setProperty('/boResults', []);
											_mdl.setProperty('/origBoResults', []);
											_mdl.setProperty('/count', 0);
											_mdl.setProperty('/boCount', 0);
											_mdl.setProperty('/appCount', 0);

										}

									}

									sap.ui.getCore().byId('CESLookupHeader').setVisible(false);

									searchShellHelper.setSearchState('EXP');
									var t = searchShellHelper;
									function E(o) {
										if (o.keyCode === 27) {
											o.preventDefault();
											if (a.isSearchAppActive()) {
												return;
											}
											if (t.oSearchInput) {
												if (t.oSearchInput.getValue() === "") {
													jQuery(document).off('keydown', E);
													t.setSearchState('COL');
													window.setTimeout(function () {
														sap.ui.getCore().byId('sf').focus();
													}, 1000);
												} else if (t.oSearchInput.getValue() === " ") {
													t.oSearchInput.setValue("");
												}
											}
										}
									}
									jQuery(document).on('keydown', E);



									// var _mdl = searchShellHelper.oSearchSelect.getModel();

									// searchShellHelper.onShellSearchButtonPressed(event);
								});


							}

						},

						_readSysData: function () {
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

						_refreshSysData: function () {
							// debugger;
							var currDateTime = Date.now();
							var svrRefreshTimeSpan;
							var refreshFromServer = false;

							svrRefreshTimeSpan = _getTimeSpanMinutes(currDateTime, _lastRefresh);

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
						_renderLaunchpad: function () {
							var _self = this;

							this._getRenderer()
								.fail(
									function (sErrorMessage) {
										jQuery.sap.log.error(sErrorMessage, undefined, _sComponentName);
									})
								.done(
									function (oRenderer) {

										//	setTimeout(function(handler) {
										//		_self._replacePhoto();
										//	}, 0, this);
										var sRendererExtMethod = "setFooter";

										var oTextLMPI = new sap.m.Text("txtLMPI",
											{
												wrapping: true
											})
											.setText(_resBundle.getText('footerMsg'))
											.addStyleClass("lmcesFooter");
										var oTextSysTime = new sap.m.Text(
											"txtSysTime",
											{
												text: thisObject._renderDateTime(),
												wrapping: true,
												visible: !_isPhone
											}).addStyleClass("lmcesFooter");
										var oBar = new sap.m.Bar(
											'xLMFooter',
											{
												contentLeft: oTextSysTime,
												contentMiddle: oTextLMPI
											});

										if (typeof oRenderer[sRendererExtMethod] === "function") {
											oRenderer[sRendererExtMethod]
												(oBar);

											setInterval(
												function () {
													_processIdleTime(true);
												},
												59999);
										} else {
											jQuery.sap.log.error(_resBundle.getText(errMsg1, [sRendererExtMethod]),
												undefined,
												_sComponentName);
											return;
										}
									});
						},

						_replacePhoto: function () {
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
						_getRenderer: function () {
							var oDeferred = new jQuery.Deferred(), oShellContainer, oRenderer;

							thisObject._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
							if (!thisObject._oShellContainer) {
								oDeferred.reject(_resBundle.getText(errMsg2));
							} else {
								oRenderer = thisObject._oShellContainer.getRenderer();
								if (oRenderer) {
									oDeferred.resolve(oRenderer);
								} else {
									thisObject._onRendererCreated = function (oEvent) {
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

						_renderDateTime: function (dateTimeValue, timezone) {

							var _dateval = (dateTimeValue) ? dateTimeValue : new Date();
							var _tzval = (timezone) ? timezone : 'ET';

							if (_sysDateTime == null) {
								_sysDateTime = _dateval;
							} else {
								_sysDateTime.setMinutes(_sysDateTime.getMinutes() + 1);
							}

							_sysTimeZone = _tzval || _sysTimeZone;
							return thisObject._formatDate(_sysDateTime, _sysTimeZone);
						},

						_formatDate: function (value, timezone) {
							if (value) {
								return value.toLocaleString(_config.dateFormat, { timeZone: _config.timezone }) + ' ' + timezone;
							} else {
								return value;
							}
						},
						_displayWarningMessage: function (message) {
							var bCompact = false;

							if (!_dispWarning) {

								_dispWarning = true;

								if (sap.ui.Device.support.touch === true) {
									bCompact = true;
								}

								msgBox.warning(
									message,
									{
										styleClass: bCompact ? "sapUiSizeCompact" : "",
										onClose: function () {
											_dispWarning = false;
										}
									});
							}
						},

						exit: function () {
							if (this._oShellContainer && this._onRendererCreated) {
								this._oShellContainer.detachRendererCreatedEvent(this._onRendererCreated);
							}
						},

						_showHelpMenu: function (oEvent) {
							var oButton = (oEvent.getSource().isActive()) ? oEvent.getSource() : sap.ui.getCore().byId("endItemsOverflowBtn");
							if (!this._oHelpMenu) {
								this._oHelpMenu = this._createHelpMenu();
							} else {
								this._oHelpMenu.close();
								this._oHelpMenu = null;
							}
							// var oDock = sap.ui.core.Popup.Dock;
							// this._oMenu.open(false, oButton, oDock.BeginTop, oDock.BeginBottom, oButton);
							this._oHelpMenu.openBy(oButton);
						},

						_showSearch: function (oEvent) {
							var ww = sap.ui.getCore().byId("sf");
							ww.firePress();
						},

						_showSlack: function (oEvent) {
							var oButton = (oEvent.getSource().isActive()) ? oEvent.getSource() : sap.ui.getCore().byId("endItemsOverflowBtn");
							if (!this._oSlackView) {
								this._oSlackCursor = null;
								this._oSlackView = this._createSlackView();
								this._oSlackView.openBy(oButton);
							} else {
								if (this._oSlackView.oPopup.getOpenState() === sap.ui.core.OpenState.OPEN) {
									sap.ui.getCore().byId("xSlLst").destroy();
									//sap.ui.getCore().byId("xSlack").destroy();
									this._oSlackView.close();
									this._oSlackCursor = null;
									this._oSlackView = null;
								} else {
									this._oSlackView.openBy(oButton);
								}
							}
							// var oDock = sap.ui.core.Popup.Dock;
							// this._oMenu.open(false, oButton, oDock.BeginTop, oDock.BeginBottom, oButton);

						},


						_showLanguageMenu: function (oEvent) {
							var oButton = (oEvent.getSource().isActive()) ? oEvent.getSource() : sap.ui.getCore().byId("endItemsOverflowBtn");
							if (!this._oMenu) {
								this._oMenu = this._createPopoverMenu();
							} else {
								this._oMenu.close();
								this._oMenu = null;
							}
							// var oDock = sap.ui.core.Popup.Dock;
							// this._oMenu.open(false, oButton, oDock.BeginTop, oDock.BeginBottom, oButton);
							this._oMenu.openBy(oButton);
						},

						_createHelpMenu: function () {
							var oHelpMenu = new sap.m.Popover({
								showHeader: false,
								placement: "Bottom",
								content: [
									new sap.m.ActionListItem({
										text: "CES Knowledge Library",
										press: function () {
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
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.67116", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "CES Knowledge Library CATS Time",
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.56440?mode=EU", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "CES Legacy Library (Finance)",
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.56447?mode=EU", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "CES Legacy Library (Common Support)",
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.56439?mode=EU", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "CES Legacy Library (Operations)",
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.56448?mode=EU", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "Standard Overhead Codes",
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.83973?mode=EU", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "Additional References",
										press: function () {
											window.open("http://balancia.us.lmco.com/gm/folder-1.11.83975?mode=EU", "_blank");
										}
									}),
									new sap.m.ActionListItem({
										text: "Submit Support Ticket",
										press: function () {
											window.open("https://servicecentral.external.lmco.com/service_central_portal?id=sc_cat_item&sys_id=a91ecbd81bec9850c4b8a71de54bcb89", "_blank");
										}
									}),




								]
							});
							return oHelpMenu;
						},

						_createSlackView: function () {
							var oFeedInp = new sap.m.FeedInput({
								enabled: false,
								post: function (oEvent) {
									_oModel
										.callFunction("/PostMessage", {
											urlParameters: { 'ChannelId': _config.serviceConfig.apiChannel, 'Text': oEvent.getParameter('value') },
											success: function (oData, response) {
												//_promise.resolve(oData, response);
											},
											error: function (oError) {
												//self.processErrorMessages(oError);
												//_promise.reject(oError);
											},
										});

								},
								icon: "/sap/bc/ui5_ui5/sap/zcesflp/images/slack-logo.png",
								class: "sapUiSmallMarginTopBottom"
							});
							var oList = new sap.m.List('xSlLst', { noDataText: 'Loading...' });
							var oChannelList = new sap.m.Popover('xSlack', {
								showHeader: false,
								contentWidth: '35%',
								contentMinWidth: '200px',
								placement: "Bottom",
								content: [oFeedInp, oList]
							});
							var _url = "/xdataSet(channel_id='" + _config.serviceConfig.apiChannel + "',cursor='" + ((this._oSlackCursor) ? this._oSlackCursor : "") + "')";
							var _self = this;

							oChannelList.setBusy(true);

							_oModel
								.read(_url,
									{
										async: true,
										success: function (oData, response) {
											var _stream = (oData.payload) ? JSON.parse(oData.payload) : null;
											var _messages = (_stream) ? _stream.messages : [] || [];
											_self._oSlackCursor = (_stream) ? _stream.response_metadata.next_cursor || "" : "";
											(_messages.length > 0) ? true : oList.setNoDataText('Slack Communication Error. Please try again later.');
											_messages.forEach(function (message) {
												oList.addItem(new sap.m.FeedListItem({
													sender: (message.bot_profile) ? message.bot_profile.name : message.user,
													text: message.text,
													info: message.team,
													convertLinksToAnchorTags: "All",
													timestamp: new Date(message.ts * 1000),
													//type:"Detail",
													icon: (message.subtype === 'channel_join') ? "sap-icon://add-employee" : "sap-icon://discussion",
													wrapping: true

													//	press: function() {
													//		window.open("http://balancia.us.lmco.com/gm/folder-1.11.56439?mode=EU", "_blank");
													//	}
												}));
											});
											oChannelList.setBusy(false);
										},
										error: function (oError) {
										},
									});


							return oChannelList;
						},

						_slackRead(oCL) {
							var _self = this;
							oCL.setBusy(true);

							_oModel
								.read(_url,
									{
										async: true,
										success: function (oData, response) {
											var _stream = JSON.parse(oData.payload);
											_self._oSlackCursor = _stream.response_metadata.next_cursor;
											_stream.messages.forEach(function (message) {
												oList.addItem(new sap.m.FeedListItem({
													sender: message.user,
													text: message.text,
													info: message.team,
													convertLinksToAnchorTags: "All",
													timestamp: new Date(message.ts * 1000),
													//type:"Detail",
													icon: (message.subtype === 'channel_join') ? "sap-icon://add-employee" : "sap-icon://discussion",
													wrapping: true

													//	press: function() {
													//		window.open("http://balancia.us.lmco.com/gm/folder-1.11.56439?mode=EU", "_blank");
													//	}
												}));
											});
											oChannelList.setBusy(false);
										},
										error: function (oError) {
										},
									});

						},


						_createMenu: function () {
							var oMenu = new ActionSheet({
								showCancelButton: false,
								buttons: [
									new Button({
										text: "English",
										press: function () {
											window.location.search = "sap-language=EN";
										}
									}),
									new Button({
										text: "Polski",
										press: function () {
											window.location.search = "sap-language=PL";
										}
									})
								]
							});
							return oMenu;
						},

						_createPopoverMenu: function () {
							var _self = this;
							var oMenu = new sap.m.Popover({
								showHeader: false,
								placement: "Bottom",
								content: [
									new sap.m.List({
										items: [
											new sap.m.ActionListItem({
												text: "English",
												press: function (oEvent) {
													(_self._oMenu) ? _self._oMenu.close() : false;
													window.location.search = "sap-language=EN";
													sap.ui.getCore().getConfiguration().setLanguage('en-US')
												},
											}),
											new sap.m.ActionListItem({
												text: "Polski",
												press: function (oEvent) {
													(_self._oMenu) ? _self._oMenu.close() : false;
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