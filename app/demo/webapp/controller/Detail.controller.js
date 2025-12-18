sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "demo/purchaserequest/model/formatter",
    "demo/purchaserequest/util/GanttFormatter"
], function (Controller, History, MessageToast, MessageBox, JSONModel, formatter, GanttFormatter) {
    "use strict";

    return Controller.extend("demo.purchaserequest.controller.Detail", {
        
        formatter: formatter,
        
        // Gantt formatter function
        fnTimeConverter: GanttFormatter.fnTimeConverter,

        onInit: function () {
            // Create UI model for controlling edit mode
            var oViewModel = new JSONModel({
                editMode: false
            });
            this.getView().setModel(oViewModel, "ui");

            // Initialize AI suggestions container on the UI model
            this.getView().getModel("ui").setProperty("/ai", {
                suggestions: {
                    requestDate: "2025-08-19",
                    approvalDate: "2025-08-26",
                    deliveryDate: "2025-12-20",
                    notes: "建议：\n- 将交付日期提前 7 天以降低延误风险\n- 若供应商可快速交付，则可进一步缩短交付期"
                },
                generationText: "",
                disclaimerDontShowAgain: false
            });

            // Initialize Email configuration on the UI model
            var sDefaultEmailContent = ``;

            this.getView().getModel("ui").setProperty("/email", {
                expanded: false,
                recipients: "",
                cc: "",
                subject: "",
                content: sDefaultEmailContent
            });

            // Attach route matched handler
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        /**
         * Accept a single suggestion (placeholder)
         */
        onAcceptSuggestion: function (oEvent) {
            var sText = this.getView().getModel("i18n").getResourceBundle().getText("changesSaved");
            MessageToast.show(sText);
            // Placeholder: real implementation would write the selected suggestion back to the model or call backend
        },

        /**
         * Generate AI suggestions with typing animation
         */
        onGenerateSuggestion: function (oEvent) {
            // Directly start generation without dialog
            this._startGeneration();
        },

        /**
         * Start typing animation for AI suggestions
         * @private
         */
        _startTypingAnimation: function () {
            var oUIModel = this.getView().getModel("ui");
            var oButton = this.getView().byId("generateBtn");

            // The full text to display
            var sFullText = "经系统监测，一项严重紧急优先级的采购业务（采购申请号1100000119，已于2025.07.15转为采购订单4510000181，涉及物料10000044主料-高碳钢线材15000KG，金额105,000元）总执行时长已累计150天，目前因采购订单审批环节停滞，导致优先级业务未能获得相应流程保障。此延误已造成业务超期与物料交付严重滞后，直接影响到零售端核心物料供应。建议立即向审批负责人Hugo, Li发送催办邮件，要求其于3个工作日内完成审批，并同步协调供应商提前备货，以最大限度减少因审批延误造成的备货时间损失。";

            var iIndex = 0;
            var iTypingSpeed = 50; // milliseconds per character

            var oTypingInterval = setInterval(function() {
                if (iIndex < sFullText.length) {
                    var sCurrentText = sFullText.substring(0, iIndex + 1);
                    oUIModel.setProperty("/ai/generationText", sCurrentText);
                    iIndex++;
                } else {
                    // Animation complete
                    clearInterval(oTypingInterval);
                    // 开始邮件字段打字动画
                    this._startEmailFieldsTypingAnimation();
                }
            }.bind(this), iTypingSpeed);
        },

        /**
         * 邮件字段打字动画，依次填充收件人、抄送人、主题、内容
         */
        _startEmailFieldsTypingAnimation: function () {
            var oUIModel = this.getView().getModel("ui");
            var oButton = this.getView().byId("generateBtn");
            var aFields = [
                { path: "/email/recipients", value: "hugo.li01@sap.com" },
                { path: "/email/cc", value: "" },
                { path: "/email/subject", value: "采购订单预警信息更新 2025.11.01" },
                { path: "/email/content", value: "您好！现有严重紧急优先级采购业务需您优先处理，关键信息如下：\n\n\t1.采购订单号：4510000181（原申请号 1100000119）；\n\t2.涉及物料：10000044 主料 - 高碳钢线材（15000KG）。\n\n恳请您于3 个工作日内完成该订单审批，保障流程推进。\n感谢配合！" }
            ];
            var i = 0;
            var typeField = function() {
                if (i >= aFields.length) {
                    // 所有字段动画完成
                    oButton.removeStyleClass("generating");
                    oButton.setEnabled(true);
                    oButton.setText("Generate");
                    oButton.setIcon("./images/qa-icon.svg");
                    MessageToast.show("AI建议和邮件信息生成完成");
                    return;
                }
                var field = aFields[i];
                var idx = 0;
                oUIModel.setProperty(field.path, "");
                var interval = setInterval(function() {
                    if (idx < field.value.length) {
                        oUIModel.setProperty(field.path, field.value.substring(0, idx + 1));
                        idx++;
                    } else {
                        clearInterval(interval);
                        i++;
                        setTimeout(typeField, 200);
                    }
                }, 30);
            };
            typeField();
        },

        /**
         * Start AI generation process
         * @private
         */
        _startGeneration: function () {
            var oButton = this.getView().byId("generateBtn");
            var oUIModel = this.getView().getModel("ui");

            // Add "generating" class
            oButton.addStyleClass("generating");

            // Change icon from Joule/SAP to loading/pending state
            oButton.setIcon("sap-icon://synchronize");

            // Disable button and show loading state
            oButton.setEnabled(false);
            oButton.setText("生成中...");

            // Clear previous text
            oUIModel.setProperty("/ai/generationText", "");

            // Random delay between 2-5 seconds
            var iDelay = Math.floor(Math.random() * 3000) + 2000; // 2000-5000ms

            setTimeout(function() {
                // Start typing animation
                this._startTypingAnimation();
            }.bind(this), iDelay);
        },

        /**
         * Route matched handler
         * @param {sap.ui.base.Event} oEvent - Route matched event
         * @private
         */
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;

            // Build a safe OData key literal. Use named key (ID=...) to ensure the service receives the correct key name
            var sBindPath;
            try {
                var sSafe = String(sObjectId).replace(/'/g, "''");
                if (/^\d+$/.test(sSafe)) {
                    // numeric key — include property name and draft flag
                    sBindPath = "/PurchaseRequests(ID=" + sSafe + ",IsActiveEntity=true)";
                } else {
                    // string/GUID keys must be quoted; include explicit key name 'ID' and draft flag
                    sBindPath = "/PurchaseRequests(ID='" + sSafe + "',IsActiveEntity=true)";
                }
            } catch (e) {
                sBindPath = "/PurchaseRequests(ID='" + String(sObjectId) + "')";
            }

            // Debug: log the bind path so we can inspect requests in browser console
            /* eslint-disable no-console */
            console.log("Detail: binding to", sBindPath, "(includes IsActiveEntity=true for draft-enabled service)");
            /* eslint-enable no-console */

            // Bind the view to the object path
            this.getView().bindElement({
                path: sBindPath,
                parameters: {
                    $expand: "priority,requestStatus,supplier,orderUnit,currency,contactPerson,purchaseFlow,purchaseProcessTimeline"
                },
                events: {
                    dataRequested: function () {
                        this.getView().setBusy(true);
                    }.bind(this),
                    dataReceived: function (oEvent) {
                        this.getView().setBusy(false);
                        // Set Gantt table row count to match actual data
                        this._adjustGanttRowCount();
                        // 删除Table手动绑定，依赖XML自动绑定
                        // this._setupDetailTable();
                    }.bind(this),
                    change: this._onBindingChange.bind(this)
                }
            });

            // Reset edit mode
            this.getView().getModel("ui").setProperty("/editMode", false);

            // Clear AI generation text when entering the page
            this.getView().getModel("ui").setProperty("/ai/generationText", "");
        },

        /**
         * Binding change handler
         * @private
         */
        _onBindingChange: function () {
            var oView = this.getView();
            var oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getOwnerComponent().getRouter().getTargets().display("notFound");
            }
        },

        /**
         * Adjust Gantt table row count to match actual data
         * @private
         */
        _adjustGanttRowCount: function () {
            // Use setTimeout to ensure data binding is complete
            setTimeout(function() {
                try {
                    var oTable = this.getView().byId("treeTable");
                    var oGanttContainer = this.getView().byId("ganttContainer");
                    
                    if (oTable && oGanttContainer) {
                        var oBinding = oTable.getBinding("rows");
                        if (oBinding) {
                            // Get actual row count from binding
                            var iLength = oBinding.getLength();
                            
                            // Fallback: try to get contexts count
                            if (iLength === 0) {
                                var aContexts = oBinding.getContexts();
                                if (aContexts) {
                                    iLength = aContexts.length;
                                }
                            }
                            
                            if (iLength > 0) {
                                // Calculate dynamic height: row height (48px) * data count + header/toolbar (120px)
                                var iHeight = Math.max(iLength * 48 + 120, 200);
                                
                                // Update container height
                                oGanttContainer.setHeight(iHeight + "px");
                                
                                // Set visible row count to actual data length
                                oTable.setVisibleRowCount(iLength);
                                
                                // Log for debugging
                                console.log("Gantt adjusted: " + iLength + " rows, height: " + iHeight + "px");
                            }
                        }
                    }
                } catch (e) {
                    // Fallback: do nothing if there's an error
                    console.error("Error adjusting Gantt row count:", e);
                }
            }.bind(this), 100);
        },

        /**
         * Navigate back to previous page
         */
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteList", {}, true);
            }
        },

        /**
         * Enable edit mode
         */
        onEdit: function () {
            this.getView().getModel("ui").setProperty("/editMode", true);
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("editModeEnabled"));
        },

        /**
         * Save changes
         */
        onSave: function () {
            var oModel = this.getView().getModel();
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            // Check if there are pending changes
            if (oModel.hasPendingChanges()) {
                oModel.submitBatch("updateGroup").then(function () {
                    MessageToast.show(oResourceBundle.getText("changesSaved"));
                    this.getView().getModel("ui").setProperty("/editMode", false);
                }.bind(this), function (oError) {
                    MessageBox.error(oResourceBundle.getText("saveFailed"));
                }.bind(this));
            } else {
                MessageToast.show(oResourceBundle.getText("noChanges"));
                this.getView().getModel("ui").setProperty("/editMode", false);
            }
        },

        /**
         * Cancel edit mode
         */
        onCancel: function () {
            var oModel = this.getView().getModel();
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (oModel.hasPendingChanges()) {
                MessageBox.confirm(oResourceBundle.getText("confirmCancel"), {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.resetChanges();
                            this.getView().getModel("ui").setProperty("/editMode", false);
                            MessageToast.show(oResourceBundle.getText("changesCancelled"));
                        }
                    }.bind(this)
                });
            } else {
                this.getView().getModel("ui").setProperty("/editMode", false);
            }
        },

        /**
         * Delete current object
         */
        onDelete: function () {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oContext = this.getView().getBindingContext();

            MessageBox.confirm(oResourceBundle.getText("confirmDelete"), {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var oModel = this.getView().getModel();
                        
                        oContext.delete().then(function () {
                            MessageToast.show(oResourceBundle.getText("deleteSuccess"));
                            this.onNavBack();
                        }.bind(this), function (oError) {
                            MessageBox.error(oResourceBundle.getText("deleteFailed"));
                        });
                    }
                }.bind(this)
            });
        },

        /**
         * Handle Ok button for AI result
         */
        onAcceptAIResult: function () {
            var oUIModel = this.getView().getModel("ui");
            var bDontShowAgain = oUIModel.getProperty("/ai/disclaimerDontShowAgain");
            
            if (bDontShowAgain) {
                // Save preference (could store in local storage or user preferences)
                localStorage.setItem("aiDisclaimerAccepted", "true");
            }
            
            MessageToast.show("AI建议已接受");
            // Hide the information section or keep it visible as needed
        },

        /**
         * Handle Cancel button for AI result
         */
        onCancelAIResult: function () {
            var oUIModel = this.getView().getModel("ui");
            // Clear the generated text
            oUIModel.setProperty("/ai/generationText", "");
            MessageToast.show("已取消");
        },

        /**
         * Toggle Email Configuration Panel
         */
        onToggleEmailPanel: function () {
            var oUIModel = this.getView().getModel("ui");
            var bExpanded = oUIModel.getProperty("/email/expanded");
            oUIModel.setProperty("/email/expanded", !bExpanded);
        },

        /**
         * Handle Send Email button
         */
        onSendEmail: function () {
            var oUIModel = this.getView().getModel("ui");
            var sRecipients = oUIModel.getProperty("/email/recipients");
            var sCC = oUIModel.getProperty("/email/cc");
            var sSubject = oUIModel.getProperty("/email/subject");
            var sContent = oUIModel.getProperty("/email/content");

            // Validate required fields
            if (!sRecipients || !sSubject) {
                MessageBox.error("Please fill in all required fields (Recipients and Subject).");
                return;
            }

            // Show success message
            MessageBox.success("Email sent successfully to " + sRecipients, {
                title: "Email Sent",
                onClose: function () {
                    // Collapse the panel after sending
                    oUIModel.setProperty("/email/expanded", false);
                }
            });
        },

        /**
         * Handle Contact Person Link Press in Gantt Chart
         * @param {sap.ui.base.Event} oEvent - Press event
         */
        onContactPersonPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var oBindingContext = oSource.getBindingContext();
            
            if (!oBindingContext) {
                MessageToast.show("无法获取联系人信息");
                return;
            }

            // Get contact person data
            var oData = oBindingContext.getObject();
            var sEmail = oData.purchaseRequest?.contactPerson?.emailAddress || "未设置邮箱";

            // Close existing popover if any
            if (this._oEmailPopover && this._oEmailPopover.isOpen()) {
                this._oEmailPopover.close();
            }

            // Create popover if not exists
            if (!this._oEmailPopover) {
                this._oEmailPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: sap.m.PlacementType.Right,
                    content: [
                        new sap.m.VBox({
                            items: [
                                new sap.m.HBox({
                                    alignItems: "Center",
                                    items: [
                                        new sap.ui.core.Icon({
                                            src: "sap-icon://email",
                                            color: "#0070F2",
                                            size: "1rem"
                                        }).addStyleClass("sapUiTinyMarginEnd"),
                                        new sap.m.Text({
                                            text: sEmail
                                        }).addStyleClass("sapUiSmallMarginBegin")
                                    ]
                                }).addStyleClass("sapUiTinyMargin")
                            ]
                        }).addStyleClass("sapUiSmallMargin")
                    ]
                }).addStyleClass("emailPopover");
            } else {
                // Update email text if popover already exists
                var oVBox = this._oEmailPopover.getContent()[0];
                var oHBox = oVBox.getItems()[0];
                var oText = oHBox.getItems()[1];
                oText.setText(sEmail);
            }

            // Open popover at the link
            this._oEmailPopover.openBy(oSource);
        },

        /**
         * Set up the detail table with current item data
         * @private
         */
        // _setupDetailTable: function () {
        //     var oTable = this.getView().byId("purchaseRequestDetailsTable");
        //     if (!oTable) {
        //         return;
        //     }
        //     var oContext = this.getView().getBindingContext();
        //     if (!oContext) {
        //         return;
        //     }
        //     var oData = oContext.getObject();
        //     var oTableModel = new sap.ui.model.json.JSONModel({
        //         items: [oData]
        //     });
        //     oTable.setModel(oTableModel);
        //     oTable.bindItems({
        //         path: "/items",
        //         template: oTable.getItems()[0] // Use existing template
        //     });
        // },
    });
});
