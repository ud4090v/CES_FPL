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

