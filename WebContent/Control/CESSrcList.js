sap.ushell.renderers.fiori2.search.controls.SearchButton
		.extend("zcesflp.Control.CESSearch", {
			metadata : {
				properties : {
					create : {
						type : 'boolean',
						group : 'Misc',
						defaultValue : true
					},
					addNew : {
						type : 'boolean',
						group : 'Misc',
						defaultValue : false
					},
					allowNotInList : {
						type : 'boolean',
						group : 'Misc',
						defaultValue : false
					}
				},
				aggregations : {
					"buttons" : {
						type : "sap.m.Button",
						multiple : true,
						singularName : "button"
					}
				},
			},
			lastSrc : null,

			init : function() {
			},

			renderer : {}
		});

		sap.ui.core.mvc.Controller
		.extend("zcesflp.Control.CESSrcList", {
			onExport: function() {
				var t = this;
				t.exportData = {
					columns: [],
					rows: []
				};
				if (t.table === undefined) {
					t.table = sap.ui.getCore().byId('ushell-search-result-table');
					t.model = t.table.getModel();
				}
				sap.ui.getCore().byId('dataExportButton').setEnabled(false);
				var e = t.model.query.clone();
				e.setCalculateFacets(false);
				e.setTop(10000);
				var s = function(b) {
					t._parseColumns(b.items[0]);
					var f = new S();
					var d = f.format(b, e.filter.searchTerm, {
						suppressHighlightedValues: true
					});
					for (var i = 0; i < d.length; i++) {
						b.items[i].title = d[i].title;
						b.items[i].titleDescription = d[i].titleDescription;
					}
					t._parseRows(b.items);
					t._doExport();
				};
				var a = function(b) {
					t.model.normalSearchErrorHandling(b);
					sap.ui.getCore().byId('dataExportButton').setEnabled(true);
					t.model.setProperty("/isBusy", false);
				};
				if (t.model.getProperty("/boCount") > 10000) {
					sap.m.MessageBox.information('The Export will be LIMITED!!', {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function(A) {
							if (A == sap.m.MessageBox.Action.OK) {
								t.model.setProperty("/isBusy", true);
								e.getResultSetAsync().then(s, a);
							}
							if (A == sap.m.MessageBox.Action.CANCEL) {
								sap.ui.getCore().byId('dataExportButton').setEnabled(true);
								t.model.setProperty("/isBusy", false);
							}
						}
					});
				} else {
					t.model.setProperty("/isBusy", true);
					e.getResultSetAsync().then(s, a);
				}
			},
			_parseColumns: function(f) {
				var t = this;
				var e = [];
				var i;
				var d = {
					label: f.dataSource.labelPlural,
					property: 'title_export_column',
					type: 'string'
				};
				var g = "";
				f.titleDescriptionAttributes.forEach(function(a) {
					g = g + a.label + " ";
				});
				g = g + "(" + sap.ushell.resources.i18n.getText("titleDescription") + ")";
				var h = {
					label: g,
					property: 'title_description_export_column',
					type: 'string'
				};
				var j = [];
				for (i = 0; i < f.detailAttributes.length; i++) {
					if (f.detailAttributes[i].metadata.type !== t.model.sinaNext.AttributeType.ImageUrl) {
						j.push(f.detailAttributes[i]);
					}
				}
				if (t.model.getProperty("/resultToDisplay") !== "searchResultTable") {
					e.push(d);
					if (f.titleDescriptionAttributes.length > 0) {
						e.push(h);
					}
					var l = 0;
					for (i = 0; i < j.length && l < 12; i++) {
						e = e.concat(t._getRelatedColumns(j[i]));
						l++;
					}
				} else {
					var v = [];
					t.table.getColumns().forEach(function(a) {
						if (a.getVisible()) {
							v.push(a);
						}
					});
					v.sort(function(a, b) {
						if (a.getOrder() < b.getOrder()) {
							return -1;
						}
						if (a.getOrder() > b.getOrder()) {
							return 1;
						}
						return 0;
					});
					v.forEach(function(a) {
						var b = a.getBindingContext().getObject().attributeId;
						if (b === "SEARCH_TABLE_TITLE_COLUMN") {
							e.push(d);
							return;
						}
						if (b === "SEARCH_TABLE_TITLE_DESCRIPTION_COLUMN") {
							e.push(h);
							return;
						}
						for (var i = 0; i < j.length; i++) {
							if (b === j[i].id) {
								e = e.concat(t._getRelatedColumns(j[i]));
							}
						}
					});
				}
				t.exportData.columns = e;
			},
			_getRelatedColumns: function(a) {
				var t = this;
				var b = [];
				if (a.hasOwnProperty("value")) {
					b.push(t._getColumn(a));
					if (a.unitOfMeasure) {
						b.push(t._getColumn(a.unitOfMeasure));
					}
					if (a.description) {
						b.push(t._getColumn(a.description));
					}
				}
				if (a.attributes && a.attributes.length > 0) {
					for (var i = 0; i < a.attributes.length; i++) {
						var d = a.attributes[i].attribute;
						if (d && d.label && d.id) {
							b.push(t._getColumn(d));
						}
					}
				}
				return b;
			},
			_getColumn: function(a) {
				var t = this;
				var b = {
					label: a.label,
					property: a.id
				};
				if (a.metadata.type === undefined) {
					b.type = 'string';
					return b;
				}
				switch (a.metadata.type) {
				case t.model.sinaNext.AttributeType.Double:
					b.type = 'number';
					b.scale = 2;
					break;
				case t.model.sinaNext.AttributeType.Integer:
					b.type = 'number';
					b.scale = 0;
					break;
				default:
					b.type = 'string';
				}
				return b;
			},
			_parseRows: function(s) {
				var t = this;
				var e = [];
				s.forEach(function(r) {
					var a = r.detailAttributes;
					var b = {};
					b.title_export_column = r.title;
					if (r.titleDescriptionAttributes.length > 0) {
						b.title_description_export_column = r.titleDescription;
					}
					for (var i = 0; i < a.length; i++) {
						b = t._getRelatedValues(b, a[i]);
					}
					e.push(b);
				});
				t.exportData.rows = e;
			},
			_getRelatedValues: function(r, a) {
				var t = this;
				if (a.value !== undefined && a.valueFormatted !== undefined) {
					if (t._isNumberType(a)) {
						r[a.id] = a.value;
					} else {
						r[a.id] = a.valueFormatted;
					}
					if (a.unitOfMeasure) {
						r[a.unitOfMeasure.id] = a.unitOfMeasure.value;
					}
					if (a.description) {
						r[a.description.id] = a.description.value;
					}
				}
				if (a.attributes) {
					for (var i = 0; i < a.attributes.length; i++) {
						var b = a.attributes[i].attribute;
						if (b && b.id && b.value !== undefined && b.valueFormatted !== undefined) {
							if (t._isNumberType(b)) {
								r[b.id] = b.value;
							} else {
								r[b.id] = b.valueFormatted;
							}
						}
					}
				}
				return r;
			},
			_isNumberType: function(a) {
				var i = false;
				if (a.metadata && a.metadata.type) {
					if (a.metadata.type === this.model.sinaNext.AttributeType.Double || a.metadata.type === this.model.sinaNext.AttributeType.Integer) {
						i = true;
					}
				}
				return i;
			},
			_doExport: function() {
				var t = this;
				var s = {
					workbook: {
						columns: t.exportData.columns
					},
					fileName: sap.ushell.resources.i18n.getText("exportFileName"),
					dataSource: t.exportData.rows
				};
				new c(s).build().then(function() {
					sap.ui.getCore().byId('dataExportButton').setEnabled(true);
					t.model.setProperty("/isBusy", false);
				}, function() {
					sap.ui.getCore().byId('dataExportButton').setEnabled(true);
					t.model.setProperty("/isBusy", false);
				});
			}
		});


		// sap.ui.predefine('sap/ushell/renderers/fiori2/search/controls/SearchSpreadsheet', ["sap/ui/core/mvc/Controller", 'sap/ushell/renderers/fiori2/search/SearchResultListFormatter', "sap/ui/export/Spreadsheet"], function(C, S, c) {
		// 	"use strict";
		// 	return C.extend("sap.ui.export.sample.table.Spreadsheet", {
		// 		onExport: function() {
		// 			var t = this;
		// 			t.exportData = {
		// 				columns: [],
		// 				rows: []
		// 			};
		// 			if (t.table === undefined) {
		// 				t.table = sap.ui.getCore().byId('ushell-search-result-table');
		// 				t.model = t.table.getModel();
		// 			}
		// 			sap.ui.getCore().byId('dataExportButton').setEnabled(false);
		// 			var e = t.model.query.clone();
		// 			e.setCalculateFacets(false);
		// 			e.setTop(1000);
		// 			var s = function(b) {
		// 				t._parseColumns(b.items[0]);
		// 				var f = new S();
		// 				var d = f.format(b, e.filter.searchTerm, {
		// 					suppressHighlightedValues: true
		// 				});
		// 				for (var i = 0; i < d.length; i++) {
		// 					b.items[i].title = d[i].title;
		// 					b.items[i].titleDescription = d[i].titleDescription;
		// 				}
		// 				t._parseRows(b.items);
		// 				t._doExport();
		// 			};
		// 			var a = function(b) {
		// 				t.model.normalSearchErrorHandling(b);
		// 				sap.ui.getCore().byId('dataExportButton').setEnabled(true);
		// 				t.model.setProperty("/isBusy", false);
		// 			};
		// 			if (t.model.getProperty("/boCount") > 1000) {
		// 				sap.m.MessageBox.information(sap.ushell.resources.i18n.getText("exportDataInfo"), {
		// 					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
		// 					onClose: function(A) {
		// 						if (A == sap.m.MessageBox.Action.OK) {
		// 							t.model.setProperty("/isBusy", true);
		// 							e.getResultSetAsync().then(s, a);
		// 						}
		// 						if (A == sap.m.MessageBox.Action.CANCEL) {
		// 							sap.ui.getCore().byId('dataExportButton').setEnabled(true);
		// 							t.model.setProperty("/isBusy", false);
		// 						}
		// 					}
		// 				});
		// 			} else {
		// 				t.model.setProperty("/isBusy", true);
		// 				e.getResultSetAsync().then(s, a);
		// 			}
		// 		},
		// 		_parseColumns: function(f) {
		// 			var t = this;
		// 			var e = [];
		// 			var i;
		// 			var d = {
		// 				label: f.dataSource.labelPlural,
		// 				property: 'title_export_column',
		// 				type: 'string'
		// 			};
		// 			var g = "";
		// 			f.titleDescriptionAttributes.forEach(function(a) {
		// 				g = g + a.label + " ";
		// 			});
		// 			g = g + "(" + sap.ushell.resources.i18n.getText("titleDescription") + ")";
		// 			var h = {
		// 				label: g,
		// 				property: 'title_description_export_column',
		// 				type: 'string'
		// 			};
		// 			var j = [];
		// 			for (i = 0; i < f.detailAttributes.length; i++) {
		// 				if (f.detailAttributes[i].metadata.type !== t.model.sinaNext.AttributeType.ImageUrl) {
		// 					j.push(f.detailAttributes[i]);
		// 				}
		// 			}
		// 			if (t.model.getProperty("/resultToDisplay") !== "searchResultTable") {
		// 				e.push(d);
		// 				if (f.titleDescriptionAttributes.length > 0) {
		// 					e.push(h);
		// 				}
		// 				var l = 0;
		// 				for (i = 0; i < j.length && l < 12; i++) {
		// 					e = e.concat(t._getRelatedColumns(j[i]));
		// 					l++;
		// 				}
		// 			} else {
		// 				var v = [];
		// 				t.table.getColumns().forEach(function(a) {
		// 					if (a.getVisible()) {
		// 						v.push(a);
		// 					}
		// 				});
		// 				v.sort(function(a, b) {
		// 					if (a.getOrder() < b.getOrder()) {
		// 						return -1;
		// 					}
		// 					if (a.getOrder() > b.getOrder()) {
		// 						return 1;
		// 					}
		// 					return 0;
		// 				});
		// 				v.forEach(function(a) {
		// 					var b = a.getBindingContext().getObject().attributeId;
		// 					if (b === "SEARCH_TABLE_TITLE_COLUMN") {
		// 						e.push(d);
		// 						return;
		// 					}
		// 					if (b === "SEARCH_TABLE_TITLE_DESCRIPTION_COLUMN") {
		// 						e.push(h);
		// 						return;
		// 					}
		// 					for (var i = 0; i < j.length; i++) {
		// 						if (b === j[i].id) {
		// 							e = e.concat(t._getRelatedColumns(j[i]));
		// 						}
		// 					}
		// 				});
		// 			}
		// 			t.exportData.columns = e;
		// 		},
		// 		_getRelatedColumns: function(a) {
		// 			var t = this;
		// 			var b = [];
		// 			if (a.hasOwnProperty("value")) {
		// 				b.push(t._getColumn(a));
		// 				if (a.unitOfMeasure) {
		// 					b.push(t._getColumn(a.unitOfMeasure));
		// 				}
		// 				if (a.description) {
		// 					b.push(t._getColumn(a.description));
		// 				}
		// 			}
		// 			if (a.attributes && a.attributes.length > 0) {
		// 				for (var i = 0; i < a.attributes.length; i++) {
		// 					var d = a.attributes[i].attribute;
		// 					if (d && d.label && d.id) {
		// 						b.push(t._getColumn(d));
		// 					}
		// 				}
		// 			}
		// 			return b;
		// 		},
		// 		_getColumn: function(a) {
		// 			var t = this;
		// 			var b = {
		// 				label: a.label,
		// 				property: a.id
		// 			};
		// 			if (a.metadata.type === undefined) {
		// 				b.type = 'string';
		// 				return b;
		// 			}
		// 			switch (a.metadata.type) {
		// 			case t.model.sinaNext.AttributeType.Double:
		// 				b.type = 'number';
		// 				b.scale = 2;
		// 				break;
		// 			case t.model.sinaNext.AttributeType.Integer:
		// 				b.type = 'number';
		// 				b.scale = 0;
		// 				break;
		// 			default:
		// 				b.type = 'string';
		// 			}
		// 			return b;
		// 		},
		// 		_parseRows: function(s) {
		// 			var t = this;
		// 			var e = [];
		// 			s.forEach(function(r) {
		// 				var a = r.detailAttributes;
		// 				var b = {};
		// 				b.title_export_column = r.title;
		// 				if (r.titleDescriptionAttributes.length > 0) {
		// 					b.title_description_export_column = r.titleDescription;
		// 				}
		// 				for (var i = 0; i < a.length; i++) {
		// 					b = t._getRelatedValues(b, a[i]);
		// 				}
		// 				e.push(b);
		// 			});
		// 			t.exportData.rows = e;
		// 		},
		// 		_getRelatedValues: function(r, a) {
		// 			var t = this;
		// 			if (a.value !== undefined && a.valueFormatted !== undefined) {
		// 				if (t._isNumberType(a)) {
		// 					r[a.id] = a.value;
		// 				} else {
		// 					r[a.id] = a.valueFormatted;
		// 				}
		// 				if (a.unitOfMeasure) {
		// 					r[a.unitOfMeasure.id] = a.unitOfMeasure.value;
		// 				}
		// 				if (a.description) {
		// 					r[a.description.id] = a.description.value;
		// 				}
		// 			}
		// 			if (a.attributes) {
		// 				for (var i = 0; i < a.attributes.length; i++) {
		// 					var b = a.attributes[i].attribute;
		// 					if (b && b.id && b.value !== undefined && b.valueFormatted !== undefined) {
		// 						if (t._isNumberType(b)) {
		// 							r[b.id] = b.value;
		// 						} else {
		// 							r[b.id] = b.valueFormatted;
		// 						}
		// 					}
		// 				}
		// 			}
		// 			return r;
		// 		},
		// 		_isNumberType: function(a) {
		// 			var i = false;
		// 			if (a.metadata && a.metadata.type) {
		// 				if (a.metadata.type === this.model.sinaNext.AttributeType.Double || a.metadata.type === this.model.sinaNext.AttributeType.Integer) {
		// 					i = true;
		// 				}
		// 			}
		// 			return i;
		// 		},
		// 		_doExport: function() {
		// 			var t = this;
		// 			var s = {
		// 				workbook: {
		// 					columns: t.exportData.columns
		// 				},
		// 				fileName: sap.ushell.resources.i18n.getText("exportFileName"),
		// 				dataSource: t.exportData.rows
		// 			};
		// 			new c(s).build().then(function() {
		// 				sap.ui.getCore().byId('dataExportButton').setEnabled(true);
		// 				t.model.setProperty("/isBusy", false);
		// 			}, function() {
		// 				sap.ui.getCore().byId('dataExportButton').setEnabled(true);
		// 				t.model.setProperty("/isBusy", false);
		// 			});
		// 		}
		// 	});
		// });