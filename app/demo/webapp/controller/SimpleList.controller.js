sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "demo/purchaserequest/model/formatter",
    "sap/ui/core/Fragment"
], function (Controller, Filter, FilterOperator, Sorter, MessageToast, MessageBox, formatter, Fragment) {
    "use strict";

    return Controller.extend("demo.purchaserequest.controller.SimpleList", {
        
        formatter: formatter,

        onInit: function () {
            this._aFilters = [];
            
            // Initialize view model for button enablement
            var oViewModel = new sap.ui.model.json.JSONModel({
                selectedItemsCount: 0
            });
            this.getView().setModel(oViewModel, "viewModel");
        },

        /**
         * AI Button Press - Navigate to the full list page with dashboard and auto-trigger AI analysis
         */
        onAiPress: function () {
            try {
                console.log("SimpleList: AI button pressed, setting auto-trigger flag");
                MessageToast.show("正在跳转到AI分析页面...");
                
                // Store the flag in the component's data (most reliable approach)
                var oComponent = this.getOwnerComponent();
                if (!oComponent._customData) {
                    oComponent._customData = {};
                }
                oComponent._customData.autoTriggerAI = true;
                
                console.log("SimpleList: Flag set, navigating to List page");
                
                // Navigate to the List page
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteList");
            } catch (e) {
                console.error("SimpleList: Error in onAiPress:", e);
                MessageToast.show("导航失败: " + e.message);
            }
        },

        /**
         * Filter change handler for combo boxes and inputs
         * @param {sap.ui.base.Event} oEvent - Change event
         */
        onFilterChange: function (oEvent) {
            var aFilters = [];
            
            // Get filter values
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
            
            // Status filter
            if (sStatus) {
                aFilters.push(new Filter("requestStatus_code", FilterOperator.EQ, sStatus));
            }
            
            // Date range filter - filter by requestDate (申请日期)
            if (oDateRange && oDateRangeEnd) {
                // Create date objects at start of day for the start date
                var oStartDate = new Date(oDateRange);
                oStartDate.setHours(0, 0, 0, 0);
                
                // Create date objects at end of day for the end date
                var oEndDate = new Date(oDateRangeEnd);
                oEndDate.setHours(23, 59, 59, 999);
                
                aFilters.push(new Filter("requestDate", FilterOperator.BT, oStartDate, oEndDate));
            }
            
            this._aFilters = aFilters;
            
            // Apply filters to Grid Table (uses "rows" binding)
            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.filter(aFilters);
                MessageToast.show("已应用 " + aFilters.length + " 个过滤条件");
            }
        },

        /**
         * Clear all filters
         */
        onClearFilters: function () {
            // Clear filter controls
            this.byId("prNumberFilter").setValue("");
            this.byId("materialFilter").setValue("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("dateFilter").setValue("");
            
            // Clear filters from Grid Table (uses "rows" binding)
            this._aFilters = [];
            var oTable = this.byId("purchaseRequestsTable");
            var oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.filter([]);
            }
            
            MessageToast.show("Filters cleared");
        },

        /**
         * Navigate to detail page when item is pressed
         * @param {sap.ui.base.Event} oEvent - Press event
         */
        onItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            if (!oContext) {
                return;
            }
            var sObjectId = oContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                objectId: sObjectId
            });
        },

        /**
         * Handle row selection change - enables row click navigation
         * @param {sap.ui.base.Event} oEvent - Row selection event
         */
        onRowSelectionChange: function(oEvent) {
            var oTable = this.byId("purchaseRequestsTable");
            var aSelectedIndices = oTable.getSelectedIndices();
            
            // Update view model for button enablement
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/selectedItemsCount", aSelectedIndices.length);
        },

        /**
         * Handle Create button press
         */
        onCreatePress: function() {
            MessageBox.information("Create功能开发中\n\n此功能将允许创建新的采购申请单。");
        },

        /**
         * Handle Edit button press
         */
        onEditPress: function() {
            var oTable = this.byId("purchaseRequestsTable");
            var aSelectedIndices = oTable.getSelectedIndices();
            
            if (aSelectedIndices.length === 0) {
                MessageToast.show("请先选择一条记录");
                return;
            }
            
            var oContext = oTable.getContextByIndex(aSelectedIndices[0]);
            if (oContext) {
                var sIdentifier = oContext.getProperty("identifier");
                MessageBox.information("Edit功能开发中\n\n将要编辑采购申请单: " + sIdentifier);
            }
        },

        /**
         * Handle Delete button press
         */
        onDeletePress: function() {
            var oTable = this.byId("purchaseRequestsTable");
            var aSelectedIndices = oTable.getSelectedIndices();
            
            if (aSelectedIndices.length === 0) {
                MessageToast.show("请先选择要删除的记录");
                return;
            }
            
            var that = this;
            MessageBox.confirm(
                "确定要删除选中的 " + aSelectedIndices.length + " 条记录吗？",
                {
                    title: "确认删除",
                    onClose: function(oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            // Here you would call your delete service
                            MessageToast.show("删除功能开发中");
                            // Clear selection after delete
                            oTable.clearSelection();
                            that.getView().getModel("viewModel").setProperty("/selectedItemsCount", 0);
                        }
                    }
                }
            );
        },

        /**
         * Handle Export to Excel button press
         */
        onExportToExcel: function() {
            MessageToast.show("导出功能开发中");
        },

        /**
         * Update finished handler
         * @param {sap.ui.base.Event} oEvent - Update finished event
         */
        onUpdateFinished: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            var sTitle = this.getView().getModel("i18n").getResourceBundle().getText("listTitle");
            this.byId("simpleListPage").setTitle(sTitle);
            
            console.log("SimpleList table update finished, total items:", iTotal);
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
