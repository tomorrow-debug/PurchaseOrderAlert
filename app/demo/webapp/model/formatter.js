sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Format criticality value to ObjectStatus state
         * @param {number} iCriticality - Criticality value (1=Error/High, 2=Warning/Medium, 3=Success/Low)
         * @returns {string} State value for ObjectStatus
         */
        formatCriticalityState: function (iCriticality) {
            switch (iCriticality) {
                case 1:
                    return "Error";      // High priority - Red
                case 2:
                    return "Warning";    // Medium priority - Orange
                case 3:
                    return "Success";    // Low priority - Green
                default:
                    return "None";
            }
        },

        /**
         * Format criticality value to semantic color
         * @param {number} iCriticality - Criticality value
         * @returns {string} CSS class for semantic color
         */
        formatCriticalityColor: function (iCriticality) {
            switch (iCriticality) {
                case 1:
                    return "#bb0000";      // High priority - Red
                case 2:
                    return "#e78c07";      // Medium priority - Orange
                case 3:
                    return "#2b7c2b";      // Low priority - Green
                default:
                    return "#6c757d";      // Default - Gray
            }
        },

        /**
         * Format date to readable format
         * Accepts JS Date objects, numeric timestamps, ISO strings and date-only strings (YYYY-MM-DD).
         * Returns an empty string for invalid or missing values.
         * @param {Date|string|number} vDate - Date value
         * @returns {string} Formatted date string
         */
        formatDate: function (vDate) {
            if (!vDate && vDate !== 0) {
                return "";
            }

            var oDate = null;

            // If already a Date instance
            if (vDate instanceof Date) {
                oDate = vDate;
            } else if (typeof vDate === 'number') {
                // timestamp in milliseconds
                oDate = new Date(vDate);
            } else if (typeof vDate === 'string') {
                // Accept YYYY-MM-DD or full ISO strings
                var m = vDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (m) {
                    // Create date using numeric constructor to avoid timezone shifts
                    var y = parseInt(m[1], 10);
                    var mo = parseInt(m[2], 10) - 1;
                    var d = parseInt(m[3], 10);
                    oDate = new Date(y, mo, d);
                } else {
                    // Try native Date parsing for ISO-like strings
                    var tmp = new Date(vDate);
                    if (!isNaN(tmp.getTime())) {
                        oDate = tmp;
                    } else {
                        // parsing failed
                        return "";
                    }
                }
            } else {
                return "";
            }

            if (!oDate || isNaN(oDate.getTime())) {
                return "";
            }

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd"
            });
            return oDateFormat.format(oDate);
        },

        /**
         * Format currency value
         * @param {number} fValue - Currency value
         * @param {string} sCurrency - Currency code
         * @returns {string} Formatted currency string
         */
        formatCurrency: function (fValue, sCurrency) {
            if (!fValue) {
                return "";
            }
            var oCurrencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
                currencyCode: false
            });
            return oCurrencyFormat.format(fValue) + " " + (sCurrency || "");
        },

        /**
         * Format number value
         * @param {number} fValue - Number value
         * @returns {string} Formatted number string
         */
        formatNumber: function (fValue) {
            if (!fValue && fValue !== 0) {
                return "";
            }
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                maxFractionDigits: 2,
                minFractionDigits: 2,
                groupingEnabled: true
            });
            return oNumberFormat.format(fValue);
        },

        /**
         * Format priority code to display text
         * @param {string} sPriorityCode - Priority code
         * @returns {string} Priority display text
         */
        formatPriority: function (sPriorityCode) {
            var oPriorityMap = {
                "1_high": "High",
                "2_medium": "Medium",
                "3_low": "Low"
            };
            return oPriorityMap[sPriorityCode] || sPriorityCode;
        },

        /**
         * Format status code to display text
         * @param {string} sStatusCode - Status code
         * @returns {string} Status display text
         */
        formatStatus: function (sStatusCode) {
            var oStatusMap = {
                "new": "New",
                "in_process": "In Process",
                "approved": "Approved",
                "rejected": "Rejected"
            };
            return oStatusMap[sStatusCode] || sStatusCode;
        },

        /**
         * Format boolean value to Yes/No
         * @param {boolean} bValue - Boolean value
         * @returns {string} Yes or No
         */
        formatBoolean: function (bValue) {
            return bValue ? "Yes" : "No";
        },

        /**
         * Format quantity with unit
         * @param {number} iQuantity - Quantity value
         * @param {string} sUnit - Unit code
         * @returns {string} Formatted quantity with unit
         */
        formatQuantity: function (iQuantity, sUnit) {
            if (!iQuantity && iQuantity !== 0) {
                return "";
            }
            return iQuantity + " " + (sUnit || "");
        },

        /**
         * Format priority color for icons
         * @param {number} iCriticality - Criticality value
         * @returns {string} Color code
         */
        formatPriorityColor: function (iCriticality) {
            switch (iCriticality) {
                case 1:
                    return "#dc3545";      // High priority - Red
                case 2:
                    return "#fd7e14";      // Medium priority - Orange
                case 3:
                    return "#28a745";      // Low priority - Green
                default:
                    return "#6c757d";      // Default - Gray
            }
        },

        /**
         * Format priority row CSS class
         * @param {number} iCriticality - Criticality value
         * @returns {string} CSS class name
         */
        formatPriorityRowClass: function (iCriticality) {
            switch (iCriticality) {
                case 1:
                    return "priorityRowHigh";      // High priority row
                case 2:
                    return "priorityRowMedium";    // Medium priority row
                case 3:
                    return "priorityRowLow";       // Low priority row
                default:
                    return "";
            }
        },

        /**
         * Return CSS class for PR number cell based on criticality
+         * This returns the base classes plus a priority-specific class so the cell text can be colored.
         */
        formatPriorityCellClass: function (iCriticality) {
            var sBase = "tableCellText tableCellBold";
            switch (iCriticality) {
                case 1:
                    return sBase + " priorityCellHigh";
                case 2:
                    return sBase + " priorityCellMedium";
                case 3:
                    return sBase + " priorityCellLow";
                default:
                    return sBase;
            }
        }
    };
});
