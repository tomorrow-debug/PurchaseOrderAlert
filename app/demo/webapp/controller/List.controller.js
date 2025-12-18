sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Button",
    "sap/m/BusyDialog",
    "demo/purchaserequest/model/formatter",
    "sap/ui/core/Fragment"
], function (Controller, Filter, FilterOperator, Sorter, MessageToast, MessageBox, Button, BusyDialog, formatter, Fragment) {
    "use strict";

    return Controller.extend("demo.purchaserequest.controller.List", {
        
        formatter: formatter,

        onInit: function () {
            this._aFilters = [];
            
            // Initialize UI model for statistics
            var oViewModel = new sap.ui.model.json.JSONModel({
                statistics: {
                    total: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    totalValue: 0,
                    highValue: 0,
                    mediumValue: 0,
                    lowValue: 0
                }
            });
            // Also initialize chartData to zeros so the chart renders empty initially
            oViewModel.setProperty("/chartData", [
                { priority: "高", value: 0 },
                { priority: "中", value: 0 },
                { priority: "低", value: 0 }
            ]);
            this.getView().setModel(oViewModel, "ui");

            // Show dashboard initially with zero data
            oViewModel.setProperty("/dashboard", { visible: true });
            
            // Disable highlights initially
            oViewModel.setProperty("/highlightsEnabled", false);
            
            // Initialize AI analysis completed flag
            oViewModel.setProperty("/aiAnalysisCompleted", false);
            
            // Initialize AI summaries storage for typing animation
            oViewModel.setProperty("/aiSummaries", {});

            // Ensure table does not show priority colors on initial load
            var oTableInit = this.byId("purchaseRequestsTable");
            var that = this;
            try {
                if (oTableInit) {
                    // Remove colors-enabled class multiple times to ensure it's gone
                    oTableInit.removeStyleClass("colors-enabled");
                    
                    // Also attach to rowsUpdated to continuously clear AI summaries until AI analysis
                    oTableInit.attachRowsUpdated(function() {
                        if (!that._aiAnalysisCompleted) {
                            that._clearAiSummaries();
                            // Ensure no colors are shown
                            oTableInit.removeStyleClass("colors-enabled");
                        }
                    });
                }
                
                // Clear AI summaries immediately and repeatedly
                this._aiAnalysisCompleted = false;
                this._clearAiSummaries();
                
                // Clear again after short delays to handle async data loading
                setTimeout(function() {
                    that._clearAiSummaries();
                }, 100);
                
                setTimeout(function() {
                    that._clearAiSummaries();
                }, 500);
            } catch (e) {
                console.error("Error setting up table:", e);
            }

            // prepare BusyDialog handle (create lazily in onAiPress)
            this._oBusyDialog = null;

            // Flag to track if AI analysis should auto-trigger
            this._bAutoTriggerAI = false;

            // Attach to route matched event to trigger AI analysis automatically
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteList").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Handle route matched - trigger AI analysis automatically when flag is set
         * @param {sap.ui.base.Event} oEvent - Route matched event
         * @private
         */
        _onRouteMatched: function (oEvent) {
            var that = this;
            
            // Always trigger AI analysis automatically when navigating to this page
            console.log("List page: Route matched - will auto-trigger AI analysis");
            
            // Delay to ensure the page is fully rendered and data is loaded
            setTimeout(function() {
                console.log("List page: Auto-executing onAiPress()");
                that.onAiPress();
            }, 500);
        },

        /**
         * Set flag to auto-trigger AI analysis on next navigation to this page
         * This method should be called before navigating to List page
         */
        setAutoTriggerAI: function () {
            this._bAutoTriggerAI = true;
            console.log("List page: Auto-trigger flag set to true");
        },

        /**
         * Clear AI summaries for all records initially
         * @private
         */
        _clearAiSummaries: function () {
            try {
                var oModel = this.getView().getModel();
                if (!oModel) return;

                // Get the binding path for PurchaseRequests (Grid Table)
                var oTable = this.byId("purchaseRequestsTable");
                if (!oTable) return;

                var oBinding = oTable.getBinding("rows");
                if (!oBinding) return;

                // Get all contexts and clear aiSummary
                var aContexts = oBinding.getContexts(0, oBinding.getLength());
                if (aContexts && aContexts.length > 0) {
                    aContexts.forEach(function(oContext) {
                        if (oContext && oContext.setProperty) {
                            oContext.setProperty("aiSummary", "");
                        }
                    });
                    console.log("_clearAiSummaries: cleared AI summaries for", aContexts.length, "records");
                }
            } catch (e) {
                console.error("_clearAiSummaries error:", e);
            }
        },
        onAiPress: function () {
            // Show a BusyDialog with text while 'Joule' analyzes, wait 3-6s, then update UI
            try {
                var that = this;

                // create BusyDialog lazily
                if (!this._oBusyDialog) {
                    this._oBusyDialog = new BusyDialog({
                        title: "Joule",
                        text: "Joule正在分析订单情况及状态"
                    });
                }

                this._oBusyDialog.open();

                var iDelay = 3000 + Math.floor(Math.random() * 3000); // 3-6s

                setTimeout(function () {
                    try {
                        var oTable = that.byId("purchaseRequestsTable");
                        
                        // Mark AI analysis as completed
                        that._aiAnalysisCompleted = true;
                        
                        // Update statistics (cards and charts will show real data now)
                        try { 
                            that._updateStatisticsFromTable(); 
                            console.log("Statistics updated after AI analysis");
                        } catch (e) { 
                            console.error("_updateStatisticsFromTable error:", e); 
                        }
                        
                        // Enable priority colors NOW (not before)
                        try { 
                            if (oTable && oTable.addStyleClass) {
                                oTable.addStyleClass("colors-enabled");
                                console.log("Priority colors enabled after AI analysis");
                            }
                            // Also enable row highlights via UI model
                            var oViewModel = that.getView().getModel("ui");
                            if (oViewModel) {
                                oViewModel.setProperty("/highlightsEnabled", true);
                                oViewModel.setProperty("/aiAnalysisCompleted", true);
                                console.log("Row highlights and AI analysis completed flag enabled");
                            }
                        } catch(e) {
                            console.error("Error enabling colors:", e);
                        }
                        
                        // Sort table (AI status will be shown automatically via View binding)
                        setTimeout(function() {
                            try {
                                that._sortTableByPriority();
                                console.log("Table sorted by priority, AI status visible via expression binding");
                            } catch (e) {
                                console.error("Error sorting table:", e);
                            }
                        }, 500);

                        MessageToast.show("Joule 分析完成，已更新订单状态并按优先级排序");
                    } catch (e) {
                        console.error("Error during AI data load (inner):", e);
                        MessageToast.show("加载数据时出错，请查看控制台");
                    } finally {
                        try { that._oBusyDialog.close(); } catch(e){}
                    }
                }, iDelay);
            } catch (e) {
                console.error("Error during AI/data load:", e);
                MessageToast.show("加载数据时出错，请查看控制台");
                try { if (this._oBusyDialog) this._oBusyDialog.close(); } catch(e){}
            }
        },

        /**
         * Update statistics KPIs from table data
         * @private
         */
        _updateStatisticsFromTable: function () {
            var oTable = this.byId("purchaseRequestsTable");
            if (!oTable) {
                console.log("Table not found");
                return;
            }
            
            var oStats = {
                total: 0,
                high: 0,
                medium: 0,
                low: 0,
                totalValue: 0,
                highValue: 0,
                mediumValue: 0,
                lowValue: 0
            };

            // For Grid Table (sap.ui.table.Table), we need to use the binding directly
            var oBinding = oTable.getBinding("rows");
            if (!oBinding) {
                console.log("No binding found");
                return;
            }

            // Get all contexts from the binding
            var aContexts = oBinding.getContexts(0, oBinding.getLength());
            
            console.log("Processing", aContexts.length, "contexts from Grid Table");
            
            aContexts.forEach(function (oContext) {
                if (oContext) {
                    // Try to get priority_code directly or from priority object
                    var sPriorityCode = oContext.getProperty("priority_code");
                    
                    // If priority_code is not directly available, try priority/code
                    if (!sPriorityCode) {
                        sPriorityCode = oContext.getProperty("priority/code");
                    }
                    
                    var fTotalValue = parseFloat(oContext.getProperty("totalValue")) || 0;
                    
                    console.log("Item priority_code:", sPriorityCode, "totalValue:", fTotalValue);
                    
                    // Count by priority and sum value by priority
                    if (sPriorityCode === "1_high") {
                        oStats.high++;
                        oStats.highValue += fTotalValue;
                    } else if (sPriorityCode === "2_medium") {
                        oStats.medium++;
                        oStats.mediumValue += fTotalValue;
                    } else if (sPriorityCode === "3_low") {
                        oStats.low++;
                        oStats.lowValue += fTotalValue;
                    }
                    
                    // Sum total value and count
                    oStats.totalValue += fTotalValue;
                    oStats.total++;
                }
            });
            
            console.log("Statistics calculated from Grid Table:", oStats);
            
            // Update statistics
            this.getView().getModel("ui").setProperty("/statistics", oStats);
            
            // Prepare chart data - now using totalValue instead of count
            var aChartData = [
                { priority: "高", value: oStats.highValue },
                { priority: "中", value: oStats.mediumValue },
                { priority: "低", value: oStats.lowValue }
            ];
            this.getView().getModel("ui").setProperty("/chartData", aChartData);
        },

        /**
         * Filter change handler for combo boxes and inputs
         * @param {sap.ui.base.Event} oEvent - Change event
         */
        onFilterChange: function (oEvent) {
            var aFilters = [];
            
            // Get filter values
            var sPriority = this.byId("priorityFilter").getSelectedKey();
            var sStatus = this.byId("statusFilter").getSelectedKey();
            var oDateRange = this.byId("dateFilter").getDateValue();
            var oDateRangeEnd = this.byId("dateFilter").getSecondDateValue();
            var sPRNumber = this.byId("prNumberFilter").getValue();
            var sMaterial = this.byId("materialFilter").getValue();
            
            // PR Number filter
            if (sPRNumber) {
                aFilters.push(new Filter("identifier", FilterOperator.Contains, sPRNumber));
            }
            
            // Material filter
            if (sMaterial) {
                aFilters.push(new Filter("material", FilterOperator.Contains, sMaterial));
            }
            
            // Priority filter
            if (sPriority) {
                aFilters.push(new Filter("priority_code", FilterOperator.EQ, sPriority));
            }
            
            // Status filter
            if (sStatus) {
                aFilters.push(new Filter("requestStatus_code", FilterOperator.EQ, sStatus));
            }
            
            // Date range filter
            if (oDateRange && oDateRangeEnd) {
                aFilters.push(new Filter("deliveryDate", FilterOperator.BT, oDateRange, oDateRangeEnd));
            }
            
            this._aFilters = aFilters;
            
            // Apply filters to table
            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        /**
         * Clear all filters
         */
        onClearFilters: function () {
            // Clear filter controls
            this.byId("prNumberFilter").setValue("");
            this.byId("materialFilter").setValue("");
            this.byId("priorityFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("dateFilter").setValue("");
            
            // Clear filters from table
            this._aFilters = [];
            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter([]);
            
            MessageToast.show("Filters cleared");
        },

        /**
         * Search handler
         * @param {sap.ui.base.Event} oEvent - Search event
         */
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("identifier", FilterOperator.Contains, sQuery),
                        new Filter("material", FilterOperator.Contains, sQuery),
                        new Filter("shortText", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters.concat(this._aFilters));
        },

        /**
         * Open filter dialog
         */
        onOpenFilterDialog: function () {
            var oView = this.getView();

            if (!this._pFilterDialog) {
                this._pFilterDialog = Fragment.load({
                    id: oView.getId(),
                    name: "demo.purchaserequest.view.fragments.FilterDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pFilterDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Confirm filter dialog
         * @param {sap.ui.base.Event} oEvent - Confirm event
         */
        onConfirmFilter: function (oEvent) {
            var mParams = oEvent.getParameters();
            var aFilters = [];

            // Get filter items
            mParams.filterItems.forEach(function (oItem) {
                var sPath = oItem.getKey();
                var sValue = oItem.getText();
                aFilters.push(new Filter(sPath, FilterOperator.EQ, sValue));
            });

            this._aFilters = aFilters;
            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("items");
            
            // Apply filters
            var sSearchQuery = this.byId("searchField").getValue();
            var aSearchFilters = [];
            if (sSearchQuery) {
                aSearchFilters.push(new Filter({
                    filters: [
                        new Filter("identifier", FilterOperator.Contains, sSearchQuery),
                        new Filter("material", FilterOperator.Contains, sSearchQuery),
                        new Filter("shortText", FilterOperator.Contains, sSearchQuery)
                    ],
                    and: false
                }));
            }

            oBinding.filter(aSearchFilters.concat(aFilters));

            // Show message
            var sMessage = aFilters.length > 0 
                ? this.getView().getModel("i18n").getResourceBundle().getText("filterApplied", [aFilters.length])
                : this.getView().getModel("i18n").getResourceBundle().getText("filterCleared");
            MessageToast.show(sMessage);
        },

        /**
         * Open sort dialog
         */
        onOpenSortDialog: function () {
            var oView = this.getView();

            if (!this._pSortDialog) {
                this._pSortDialog = Fragment.load({
                    id: oView.getId(),
                    name: "demo.purchaserequest.view.fragments.SortDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pSortDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Confirm sort dialog
         * @param {sap.ui.base.Event} oEvent - Confirm event
         */
        onConfirmSort: function (oEvent) {
            var mParams = oEvent.getParameters();
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;

            var aSorters = [];
            aSorters.push(new Sorter(sPath, bDescending));

            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.sort(aSorters);

            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("sortApplied"));
        },

        /**
         * Refresh table
         */
        onRefresh: function () {
            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.refresh();
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("refreshed"));
        },

        /**
         * Navigate to detail page when item is pressed
         * @param {sap.ui.base.Event} oEvent - Press event
         */
        onItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var sPath = oContext.getPath();
            var sObjectId = oContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                objectId: sObjectId
            });
        },

        /**
         * Selection change handler
         * @param {sap.ui.base.Event} oEvent - Selection change event
         */
        onSelectionChange: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            if (oItem) {
                var oContext = oItem.getBindingContext();
                var sObjectId = oContext.getProperty("ID");
                
                this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                    objectId: sObjectId
                });
            }
        },

        /**
         * Update finished handler
         * @param {sap.ui.base.Event} oEvent - Update finished event
         */
        onUpdateFinished: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            // Keep the page title static — do not append the total count
            var sTitle = this.getView().getModel("i18n").getResourceBundle().getText("listTitle");
            this.byId("listPage").setTitle(sTitle);
            
            console.log("Table update finished, total items:", iTotal);

            // Do NOT auto-update statistics/chart here — keep KPI cards and chart at 0 until the user
            // clicks the load/update button. Coloring is only applied on demand (button press).
        }

        /**
         * Apply priority-based style classes to the first column (PR number) and the flag icon for each row.
         * Extracted helper so it can be invoked on demand (e.g. button press) or after table updates.
         * @private
         */
        ,_applyPriorityCellClasses: function () {
            // keep a retry counter on the controller instance
            this._iApplyPriorityAttempts = this._iApplyPriorityAttempts || 0;
            this._iApplyPriorityAttempts++;
            var iAttempt = this._iApplyPriorityAttempts;
            var iMaxAttempts = 3;
            try {
                var oTable = this.byId("purchaseRequestsTable");
                if (!oTable || !oTable.getItems) return;
                var aItems = oTable.getItems();

                // Determine threshold (at least 20)
                var iThreshold = (oTable.getGrowingThreshold && oTable.getGrowingThreshold()) || aItems.length;
                iThreshold = Math.max(20, parseInt(iThreshold, 10) || 0);

                // Try to get binding contexts for the first N records
                var oBinding = oTable.getBinding && oTable.getBinding("items");
                var aContexts = [];
                try {
                    if (oBinding && oBinding.getContexts) {
                        aContexts = oBinding.getContexts(0, iThreshold) || [];
                    }
                } catch (e) {
                    // fallback
                    aContexts = aItems.map(function(it){ try { return it.getBindingContext(); } catch(e){ return null; } }).slice(0, iThreshold);
                }

                // Map rendered items by context path
                var mItemByPath = {};
                aItems.forEach(function (it) {
                    try { var p = it.getBindingContext() && it.getBindingContext().getPath(); if (p) mItemByPath[p] = it; } catch(e){}
                });

                var fnFindText = function (control) {
                    if (!control) return null;
                    if (control.isA && control.isA("sap.m.Text")) return control;
                    var kids = [];
                    if (control.getItems) kids = control.getItems();
                    else if (control.getContent) kids = control.getContent();
                    else if (control.getAggregation) {
                        try { kids = control.getAggregation("items") || []; } catch (e) { }
                        try { if ((!kids || kids.length===0) && control.getAggregation) kids = control.getAggregation("content") || []; } catch(e) {}
                    }
                    for (var i=0;i<kids.length;i++) {
                        var found = fnFindText(kids[i]);
                        if (found) return found;
                    }
                    return null;
                };

                var fnFindIcon = function (control) {
                    if (!control) return null;
                    if (control.isA && control.isA("sap.ui.core.Icon")) return control;
                    var kids = [];
                    if (control.getItems) kids = control.getItems();
                    else if (control.getContent) kids = control.getContent();
                    else if (control.getAggregation) {
                        try { kids = control.getAggregation("items") || []; } catch (e) { }
                        try { if ((!kids || kids.length===0) && control.getAggregation) kids = control.getAggregation("content") || []; } catch(e) {}
                    }
                    for (var j=0;j<kids.length;j++) {
                        var found = fnFindIcon(kids[j]);
                        if (found) return found;
                    }
                    return null;
                };

                console.log("_applyPriorityCellClasses: attempt", iAttempt, "rendered=", aItems.length, "targetContexts=", aContexts.length, "threshold=", iThreshold);

                var iMatched = 0;
                var that = this;
                aContexts.forEach(function (oContext, idx) {
                    try {
                        if (!oContext) return;
                        var sPath = oContext.getPath();
                        var oItem = mItemByPath[sPath];
                        if (!oItem) {
                            // not rendered yet; skip — we'll retry on updateFinished if attempts remain
                            return;
                        }

                        var iCriticality = oContext.getProperty("priority/criticality");

                        // Apply row-level class
                        try {
                            oItem.removeStyleClass("priorityRowHigh"); oItem.removeStyleClass("priorityRowMedium"); oItem.removeStyleClass("priorityRowLow");
                            if (iCriticality === 1) oItem.addStyleClass("priorityRowHigh");
                            else if (iCriticality === 2) oItem.addStyleClass("priorityRowMedium");
                            else if (iCriticality === 3) oItem.addStyleClass("priorityRowLow");
                        } catch (e) {}

                        var aCells = oItem.getCells && oItem.getCells();
                        if (aCells && aCells.length > 0) {
                            var oFirstCell = aCells[0];
                            var aCandidates = [];
                            if (oFirstCell.getItems) aCandidates = oFirstCell.getItems();
                            else if (oFirstCell.getContent) aCandidates = oFirstCell.getContent();
                            else {
                                try { aCandidates = oFirstCell.getAggregation("items") || []; } catch(e){}
                                try { if ((!aCandidates || aCandidates.length===0) && oFirstCell.getAggregation) aCandidates = oFirstCell.getAggregation("content") || []; } catch(e){}
                            }

                            var oTextControl = null;
                            for (var k=0;k<aCandidates.length;k++) {
                                oTextControl = fnFindText(aCandidates[k]);
                                if (oTextControl) break;
                            }

                            if (oTextControl && oTextControl.addStyleClass) {
                                oTextControl.removeStyleClass("priorityCellHigh");
                                oTextControl.removeStyleClass("priorityCellMedium");
                                oTextControl.removeStyleClass("priorityCellLow");
                                if (iCriticality === 1) oTextControl.addStyleClass("priorityCellHigh");
                                else if (iCriticality === 2) oTextControl.addStyleClass("priorityCellMedium");
                                else if (iCriticality === 3) oTextControl.addStyleClass("priorityCellLow");
                            }

                            var oIcon = null;
                            for (var m=0;m<aCandidates.length;m++) {
                                oIcon = fnFindIcon(aCandidates[m]);
                                if (oIcon) break;
                            }
                            if (oIcon && oIcon.addStyleClass) {
                                oIcon.removeStyleClass("priorityCellHigh");
                                oIcon.removeStyleClass("priorityCellMedium");
                                oIcon.removeStyleClass("priorityCellLow");
                                if (iCriticality === 1) oIcon.addStyleClass("priorityCellHigh");
                                else if (iCriticality === 2) oIcon.addStyleClass("priorityCellMedium");
                                else if (iCriticality === 3) oIcon.addStyleClass("priorityCellLow");
                            }
                        }

                    } catch (e) {
                        // ignore per-row errors
                    }
                });

                // If we didn't match all contexts, schedule a retry (attach to updateFinished once)
                try {
                    // count matched items by comparing mapped paths
                    iMatched = Object.keys(mItemByPath).filter(function(p){ return aContexts.some(function(c){ return c && c.getPath && c.getPath() === p; }); }).length;
                } catch (e) { iMatched = 0; }

                if (iMatched < aContexts.length && iAttempt < iMaxAttempts) {
                    console.log("_applyPriorityCellClasses: only matched", iMatched, "of", aContexts.length, "contexts — will retry (attempt", iAttempt+1, ") on next updateFinished");
                    // Attach a one-time updateFinished to retry after render completes
                    var oTable = this.byId("purchaseRequestsTable");
                    if (oTable && oTable.attachEventOnce) {
                        oTable.attachEventOnce("updateFinished", function () {
                            // schedule a small timeout to allow DOM to settle
                            setTimeout(function () {
                                try { that._applyPriorityCellClasses(); } catch (e) { console.error(e); }
                            }, 80);
                        });
                    }
                }

            } catch (e) {
                console.error("Error applying priority cell classes:", e);
            }
            finally {
                // if we've reached max attempts, reset counter so future AI actions start fresh
                if (iAttempt >= iMaxAttempts) this._iApplyPriorityAttempts = 0;
            }
        }

        ,onToggleDashboard: function () {
            try {
                var oUi = this.getView().getModel("ui");
                if (!oUi) return;
                var b = !!oUi.getProperty("/dashboard/visible");
                oUi.setProperty("/dashboard/visible", !b);

                // flip the icon direction on the small button (if present)
                var oBtnRight = this.byId("dashboardToggleBtn");
                if (oBtnRight && oBtnRight.setIcon) {
                    oBtnRight.setIcon(!b ? "sap-icon://slim-arrow-down" : "sap-icon://slim-arrow-up");
                }
                var oBtnCenter = this.byId("dashboardCollapseCenterBtn");
                if (oBtnCenter && oBtnCenter.setIcon) {
                    oBtnCenter.setIcon(!b ? "sap-icon://slim-arrow-down" : "sap-icon://slim-arrow-up");
                }
            } catch (e) { console.error(e); }
        }

        /**
         * Programmatically sort the table by priority/criticality so High (1) appears first.
         * Uses a custom sorter on the binding that sorts by 'priority/criticality' ascending
         * (1 = High, 2 = Medium, 3 = Low). We want High first so ascending numeric order works.
         * @private
         */
        ,_sortByPriority: function () {
            try {
                var oTable = this.byId("purchaseRequestsTable");
                if (!oTable) return;
                var oBinding = oTable.getBinding("items");
                if (!oBinding) return;

                // Create sorter that uses path 'priority/criticality' (numeric)
                var oSorter = new Sorter("priority/criticality", false); // false -> ascending (1,2,3)
                // Apply the sorter
                console.log("_sortByPriority: applying sorter on binding");
                oBinding.sort([oSorter]);

                // Force a refresh and re-render to ensure UI updates immediately
                try { if (oBinding.refresh) oBinding.refresh(); } catch (e) { }
                try { oTable.invalidate(); } catch (e) { }
                try { if (oTable.getDomRef && oTable.getDomRef()) oTable.rerender(); } catch (e) { }

                // Re-apply any active filters to keep current view consistent
                try { if (this._aFilters && this._aFilters.length>0) oBinding.filter(this._aFilters); } catch(e){}

                console.log("_sortByPriority: sorter applied and UI refresh attempted");
            } catch (e) {
                console.error("_sortByPriority error:", e);
            }
        },

        /**
         * Sort Grid Table by priority (for sap.ui.table.Table)
         * @private
         */
        _sortTableByPriority: function () {
            try {
                var oTable = this.byId("purchaseRequestsTable");
                if (!oTable) {
                    console.log("Table not found for sorting");
                    return;
                }
                
                var oBinding = oTable.getBinding("rows");
                if (!oBinding) {
                    console.log("No binding found for sorting");
                    return;
                }

                // Create custom sorter function
                // Priority order: 1_high < 2_medium < 3_low (ascending order)
                var fnComparator = function(a, b) {
                    var aPriority = a;
                    var bPriority = b;
                    
                    // Map priority codes to numbers for comparison
                    var priorityMap = {
                        "1_high": 1,
                        "2_medium": 2,
                        "3_low": 3
                    };
                    
                    var aValue = priorityMap[aPriority] || 999;
                    var bValue = priorityMap[bPriority] || 999;
                    
                    return aValue - bValue;
                };

                // Create sorter using priority_code field
                var oSorter = new Sorter("priority_code", false, false, fnComparator);
                
                console.log("Sorting Grid Table by priority_code");
                oBinding.sort(oSorter);
                
                console.log("Grid Table sorted by priority");
            } catch (e) {
                console.error("Error sorting Grid Table:", e);
            }
        },

        /**
         * Fill AI summaries with simple status text
         * @private
         */
        _fillAiSummaries: function () {
            try {
                var oTable = this.byId("purchaseRequestsTable");
                if (!oTable) return;

                var oBinding = oTable.getBinding("rows");
                if (!oBinding) return;

                // Define simple status text based on priority
                var statusText = {
                    "1_high": "非常紧急",
                    "2_medium": "一般紧急",
                    "3_low": "正常状态"
                };

                // Get all contexts
                var aContexts = oBinding.getContexts(0, oBinding.getLength());
                if (!aContexts || aContexts.length === 0) return;

                console.log("Filling AI status for", aContexts.length, "records");
                
                // Fill all contexts immediately with simple status
                aContexts.forEach(function(oContext) {
                    if (oContext && oContext.setProperty) {
                        var sPriorityCode = oContext.getProperty("priority_code");
                        var sStatus = statusText[sPriorityCode] || "正常状态";
                        oContext.setProperty("aiSummary", sStatus);
                    }
                });
                
                console.log("AI status filled");
                
            } catch (e) {
                console.error("Error filling AI summaries:", e);
            }
        },

        /**
         * Show detailed AI analysis for a specific row in a popover
         * @param {sap.ui.base.Event} oEvent - The button press event
         * @public
         */
        onShowAiDetail: function(oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            
            if (!oContext) return;
            
            var sPriorityCode = oContext.getProperty("priority_code");
            var sPrNumber = oContext.getProperty("identifier") || oContext.getProperty("purchaseOrder") || "N/A";
            
            // Define detailed AI analysis based on priority
            var detailedAnalysis = {
                "1_high": "采购申请待审批时间较长，建议加快处理。该订单已经超过标准审批周期，可能影响供应链的正常运转，建议相关审批人员优先处理此申请。",
                "2_medium": "请尽快完成采购申请的审批流程，避免影响后续环节。当前审批进度正常，但仍需关注，确保在规定时间内完成审批，以免延误采购计划。",
                "3_low": "审批环节已超期，请相关责任人尽快处理。虽然优先级较低，但建议按照既定流程完成审批，保持良好的流程管理。"
            };
            
            var sDetailText = detailedAnalysis[sPriorityCode] || "暂无详细分析。";
            
            // Get priority info for styling
            var oPriorityInfo = {
                "1_high": {
                    icon: "sap-icon://alert",
                    iconColor: "#d32f2f",
                    bgColor: "#ffebee",
                    title: "非常紧急"
                },
                "2_medium": {
                    icon: "sap-icon://warning",
                    iconColor: "#f57c00",
                    bgColor: "#fff3e0",
                    title: "一般紧急"
                },
                "3_low": {
                    icon: "sap-icon://message-success",
                    iconColor: "#388e3c",
                    bgColor: "#e8f5e9",
                    title: "正常状态"
                }
            };
            
            var oInfo = oPriorityInfo[sPriorityCode] || oPriorityInfo["3_low"];
            
            // Create popover if it doesn't exist
            if (!this._oAiPopover) {
                this._oAiPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: sap.m.PlacementType.Left,
                    contentWidth: "380px",
                    content: [
                        new sap.m.VBox({
                            items: [
                                // Header with icon and title
                                new sap.m.HBox({
                                    alignItems: "Center",
                                    justifyContent: "SpaceBetween",
                                    items: [
                                        new sap.m.HBox({
                                            alignItems: "Center",
                                            items: [
                                                new sap.ui.core.Icon({
                                                    src: "sap-icon://alert",
                                                    size: "1.5rem",
                                                    color: "#d32f2f"
                                                }).addStyleClass("sapUiTinyMarginEnd"),
                                                new sap.m.VBox({
                                                    items: [
                                                        new sap.m.Title({
                                                            text: "AI 智能分析",
                                                            level: "H5"
                                                        }),
                                                        new sap.m.Text({
                                                            text: "",
                                                            maxLines: 1
                                                        }).addStyleClass("sapUiTinyMarginTop")
                                                    ]
                                                })
                                            ]
                                        }),
                                        new sap.m.Button({
                                            icon: "sap-icon://decline",
                                            type: "Transparent",
                                            press: function() {
                                                this._oAiPopover.close();
                                            }.bind(this)
                                        })
                                    ]
                                }).addStyleClass("sapUiTinyMarginBottom"),
                                
                                // Status badge
                                new sap.m.HBox({
                                    alignItems: "Center",
                                    items: [
                                        new sap.ui.core.Icon({
                                            src: "sap-icon://alert",
                                            size: "1rem",
                                            color: "#d32f2f"
                                        }).addStyleClass("sapUiTinyMarginEnd"),
                                        new sap.m.Text({
                                            text: "非常紧急"
                                        })
                                    ]
                                }).addStyleClass("aiPopoverBadge sapUiTinyMarginBottom"),
                                
                                // Divider
                                new sap.m.VBox({
                                    height: "1px"
                                }).addStyleClass("sapUiTinyMarginBottom aiPopoverDivider"),
                                
                                // AI Analysis text
                                new sap.m.VBox({
                                    items: [
                                        new sap.m.Label({
                                            text: "分析建议",
                                            design: "Bold"
                                        }).addStyleClass("sapUiTinyMarginBottom"),
                                        new sap.m.Text({
                                            text: "",
                                            maxLines: 0
                                        }).addStyleClass("aiPopoverText")
                                    ]
                                })
                            ]
                        }).addStyleClass("aiPopoverContent")
                    ]
                }).addStyleClass("aiPopover");
                this.getView().addDependent(this._oAiPopover);
            }
            
            // Update popover content with current data
            var oContent = this._oAiPopover.getContent()[0];
            var aItems = oContent.getItems();
            
            // Update header icon and color
            aItems[0].getItems()[0].getItems()[0].setSrc(oInfo.icon);
            aItems[0].getItems()[0].getItems()[0].setColor(oInfo.iconColor);
            // Update PR number
            aItems[0].getItems()[0].getItems()[1].getItems()[1].setText("采购单号: " + sPrNumber);
            
            // Update status badge
            aItems[1].getItems()[0].setSrc(oInfo.icon);
            aItems[1].getItems()[0].setColor(oInfo.iconColor);
            aItems[1].getItems()[1].setText(oInfo.title);
            
            // Update badge background color based on priority
            var sBadgeClass = "";
            if (sPriorityCode === "1_high") {
                sBadgeClass = "aiPopoverBadgeHigh";
            } else if (sPriorityCode === "2_medium") {
                sBadgeClass = "aiPopoverBadgeMedium";
            } else {
                sBadgeClass = "aiPopoverBadgeLow";
            }
            aItems[1].removeStyleClass("aiPopoverBadgeHigh aiPopoverBadgeMedium aiPopoverBadgeLow");
            aItems[1].addStyleClass(sBadgeClass);
            
            // Update analysis text
            aItems[3].getItems()[1].setText(sDetailText);
            
            // Open popover
            this._oAiPopover.openBy(oButton);
        },

        /**
         * Start the AI summary typing animation for all visible table rows
         * @private
         */
        _startAiSummaryTypingAnimation: function () {
            try {
                var oTable = this.byId("purchaseRequestsTable");
                if (!oTable) return;

                var aItems = oTable.getItems && oTable.getItems();
                if (!aItems || aItems.length === 0) {
                    // For Grid Table, just fill the summaries directly
                    this._fillAiSummaries();
                    return;
                }

                // Get threshold for visible items
                var iThreshold = (oTable.getGrowingThreshold && oTable.getGrowingThreshold()) || aItems.length;
                iThreshold = Math.max(20, parseInt(iThreshold, 10) || 0);
                var aVisibleItems = aItems.slice(0, Math.min(aItems.length, iThreshold));

                console.log("_startAiSummaryTypingAnimation: animating", aVisibleItems.length, "items");

                // Process each visible item
                var that = this;
                var iCurrentItem = 0;

                function processNextItem() {
                    if (iCurrentItem >= aVisibleItems.length) {
                        console.log("_startAiSummaryTypingAnimation: animation completed for all items");
                        return;
                    }

                    var oItem = aVisibleItems[iCurrentItem];
                    iCurrentItem++;

                    try {
                        var oContext = oItem.getBindingContext();
                        if (!oContext) {
                            processNextItem();
                            return;
                        }

                        // Get the full AI summary text from the model
                        var sFullText = oContext.getProperty("aiSummary") || "";
                        if (!sFullText) {
                            processNextItem();
                            return;
                        }

                        // Find the AI summary text control in the last cell
                        var aCells = oItem.getCells && oItem.getCells();
                        if (!aCells || aCells.length === 0) {
                            processNextItem();
                            return;
                        }

                        // AI summary is in the last cell (index based on column count)
                        var oLastCell = aCells[aCells.length - 1];
                        if (!oLastCell) {
                            processNextItem();
                            return;
                        }

                        // Find the Text control within the cell
                        var oTextControl = that._findTextControl(oLastCell);
                        if (!oTextControl) {
                            processNextItem();
                            return;
                        }

                        // Start typing animation for this item
                        that._animateTextTyping(oTextControl, sFullText, function() {
                            // After this item's animation completes, move to next item
                            setTimeout(processNextItem, 200); // Small delay between items
                        });

                    } catch (e) {
                        console.error("_startAiSummaryTypingAnimation: error processing item", iCurrentItem, e);
                        processNextItem();
                    }
                }

                // Start processing the first item
                processNextItem();

            } catch (e) {
                console.error("_startAiSummaryTypingAnimation error:", e);
            }
        }

        /**
         * Find the Text control within a given control (recursive search)
         * @param {sap.ui.core.Control} oControl - The control to search in
         * @returns {sap.m.Text|null} - The found Text control or null
         * @private
         */
        ,_findTextControl: function (oControl) {
            if (!oControl) return null;

            // If this is already a Text control, return it
            if (oControl.isA && oControl.isA("sap.m.Text")) {
                return oControl;
            }

            // Search in aggregations
            var aAggregations = ["items", "content"];
            for (var i = 0; i < aAggregations.length; i++) {
                try {
                    var aChildren = oControl.getAggregation && oControl.getAggregation(aAggregations[i]);
                    if (aChildren && Array.isArray(aChildren)) {
                        for (var j = 0; j < aChildren.length; j++) {
                            var oFound = this._findTextControl(aChildren[j]);
                            if (oFound) return oFound;
                        }
                    }
                } catch (e) {
                    // Ignore errors and continue searching
                }
            }

            return null;
        }

        /**
         * Animate text typing character by character
         * @param {sap.m.Text} oTextControl - The text control to animate
         * @param {string} sFullText - The full text to type
         * @param {function} fnCallback - Callback function when animation completes
         * @private
         */
        ,_animateTextTyping: function (oTextControl, sFullText, fnCallback) {
            if (!oTextControl || !sFullText) {
                if (fnCallback) fnCallback();
                return;
            }

            var iCurrentIndex = 0;
            var iTypingSpeed = 50; // milliseconds per character

            var oTimer = setInterval(function() {
                try {
                    iCurrentIndex++;
                    var sCurrentText = sFullText.substring(0, iCurrentIndex);
                    oTextControl.setText(sCurrentText);

                    if (iCurrentIndex >= sFullText.length) {
                        clearInterval(oTimer);
                        if (fnCallback) fnCallback();
                    }
                } catch (e) {
                    console.error("_animateTextTyping error:", e);
                    clearInterval(oTimer);
                    if (fnCallback) fnCallback();
                }
            }, iTypingSpeed);
        },

        /**
         * Toggle row highlights based on priority
         */
        onToggleHighlights: function() {
            var oTable = this.byId("purchaseRequestsTable");
            if (oTable.hasStyleClass("colors-enabled")) {
                oTable.removeStyleClass("colors-enabled");
                MessageToast.show("Priority highlights disabled");
            } else {
                oTable.addStyleClass("colors-enabled");
                MessageToast.show("Priority highlights enabled");
            }
        },

        /**
         * Toggle alternate row colors
         */
        onToggleAlternateRowColors: function() {
            var oTable = this.byId("purchaseRequestsTable");
            var bCurrentValue = oTable.getAlternateRowColors();
            oTable.setAlternateRowColors(!bCurrentValue);
            MessageToast.show(bCurrentValue ? "Alternate row colors disabled" : "Alternate row colors enabled");
        }
    });
});
