sap.ui.define([
	"sap/gantt/misc/Format"
], function (Format) {
	"use strict";

	return {
		/**
		 * Format date for display in table
		 * @param {string} sTimestamp - ISO timestamp string
		 * @returns {string} Formatted date string (YYYY-MM-DD)
		 */
		formatDate: function (sTimestamp) {
			if (!sTimestamp) {
				return "";
			}
			
			try {
				var oDate = new Date(sTimestamp);
				if (isNaN(oDate.getTime())) {
					return "";
				}
				
				var year = oDate.getFullYear();
				var month = String(oDate.getMonth() + 1).padStart(2, '0');
				var day = String(oDate.getDate()).padStart(2, '0');
				
				return year + "-" + month + "-" + day;
			} catch (error) {
				console.warn('Error formatting date:', error);
				return "";
			}
		},

		/**
		 * Check if the type is 'task'
		 * @param {string} type - The type value
		 * @returns {boolean} True if type is 'task'
		 */
		isTask: function (type) {
			return type === 'task';
		},

		/**
		 * Converts ISO timestamp to JavaScript Date object for Gantt chart
		 * @param {string} sTimestamp - ISO timestamp string (e.g., "2025-08-01T09:00:00Z")
		 * @returns {Date} JavaScript Date object
		 */
		fnTimeConverter: function (sTimestamp) {
			if (!sTimestamp && sTimestamp !== 0) {
				return null;
			}

			// Accept YYYY-MM-DD or ISO timestamp strings
			if (sTimestamp instanceof Date) {
				return sTimestamp;
			}

			if (typeof sTimestamp === 'string') {
				var m = sTimestamp.match(/^(\d{4})-(\d{2})-(\d{2})$/);
				if (m) {
					var y = parseInt(m[1], 10);
					var mo = parseInt(m[2], 10) - 1;
					var d = parseInt(m[3], 10);
					return new Date(y, mo, d);
				}
				// fallback to native parsing for ISO strings
				var tmp = new Date(sTimestamp);
				if (!isNaN(tmp.getTime())) return tmp;
				return null;
			}

			if (typeof sTimestamp === 'number') {
				return new Date(sTimestamp);
			}

			return null;
		},

		/**
		 * Calculate duration in days between start and end time
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {number} Duration in days
		 */
		calculateDuration: function (startTime, endTime) {
			if (!startTime || !endTime) {
				return 0;
			}
			
			try {
				var start = new Date(startTime);
				var end = new Date(endTime);
				
				if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
					var diffTime = Math.abs(end - start);
					var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
					return diffDays;
				}
			} catch (error) {
				console.warn('Error calculating duration:', error);
			}
			
			return 0;
		},

		/**
		 * Get state based on duration for ObjectNumber
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {string} State: Error, Warning, Success, or None
		 */
		getDurationState: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			
			if (duration > 30) {
				return "Error"; // Red for long tasks
			} else if (duration >= 15) {
				return "Warning"; // Orange for medium tasks
			} else if (duration > 0) {
				return "Success"; // Green for short tasks
			}
			
			return "None";
		},

		/**
		 * Get task color based on duration
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {string} Color code
		 */
		getTaskColor: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			
			if (duration > 30) {
				return '#E15361'; // Red for tasks > 30 days
			} else if (duration > 15) {
				return '#FE8C09'; // Orange for tasks 15-30 days
			} else if (duration > 0) {
				return '#39AC4C'; // Green for tasks 0-15 days
			}
			
			return '#D8D8D8'; // Light gray for zero duration
		},

		/**
		 * Get task border color based on duration
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {string} Border color code
		 */
		getTaskBorderColor: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			
			if (duration > 30) {
				return '#C4424F'; // Darker red
			} else if (duration > 15) {
				return '#E57D08'; // Darker orange
			} else if (duration > 0) {
				return '#2E9A3F'; // Darker green
			}
			
			return '#B8B8B8'; // Dark gray
		},

		/**
		 * Get background color for task based on duration
		 * Shows gray background for delayed tasks
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {string} Background color or transparent
		 */
		getBackgroundColor: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			// 所有灰色背景都用#B0B0B0
			if (duration > 0) {
				return '#B0B0B0';
			}
			return 'transparent';
		},

		/**
		 * Check if background should be visible
		 * @param {string} type - Task type
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {boolean} True if background should be visible
		 */
		isBackgroundVisible: function (type, startTime, endTime) {
			if (type !== 'task') return false;
			var duration = this.calculateDuration(startTime, endTime);
			// Show background for tasks > 15 days
			return duration > 15;
		},

		/**
		 * Calculate background end time based on duration
		 * For 15-30 day tasks: background covers 0-15 days
		 * For >30 day tasks: background covers 0-30 days
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {Date} Background end time
		 */
		getBackgroundEndTime: function (startTime, endTime) {
			if (!startTime || !endTime) {
				return null;
			}
			
			try {
				var start = new Date(startTime);
				var duration = this.calculateDuration(startTime, endTime);
				
				if (!isNaN(start.getTime())) {
					var bgDays = 0;
					
					if (duration > 30) {
						// For tasks > 30 days, show background for first 30 days
						bgDays = 30;
					} else if (duration > 15) {
						// For tasks 15-30 days, show background for first 15 days
						bgDays = 15;
					} else if (duration > 0) {
						// 0-15天，背景条长度为任务实际长度-1天（最少1天）
						bgDays = Math.max(duration - 1, 1);
					} else {
						// No background for 0-15 day tasks
						return start;
					}
					
					var bgEndTime = new Date(start.getTime() + (bgDays * 24 * 60 * 60 * 1000));
					return bgEndTime;
				}
			} catch (error) {
				console.warn('Error calculating background end time:', error);
			}
			
			return null;
		},

		/**
		 * Get 15-day marker start time (always from task start)
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {Date} Marker start time
		 */
		get15DayMarkerStart: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			if (duration <= 15) return null;
			
			try {
				var start = new Date(startTime);
				return new Date(start.getTime() + (14 * 24 * 60 * 60 * 1000));
			} catch (error) {
				return null;
			}
		},

		/**
		 * Get 15-day marker end time (15th day + 1 day for visibility)
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {Date} Marker end time
		 */
		get15DayMarkerEnd: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			if (duration <= 15) return null;
			
			try {
				var start = new Date(startTime);
				return new Date(start.getTime() + (15 * 24 * 60 * 60 * 1000));
			} catch (error) {
				return null;
			}
		},

		/**
		 * Get 15-day marker color
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {string} Marker color or transparent
		 */
		get15DayMarkerColor: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			return duration > 15 ? '#FE8C09' : 'transparent';
		},

		/**
		 * Check if 15-day marker should be visible
		 * @param {string} type - Task type
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {boolean} True if marker should be visible
		 */
		is15DayMarkerVisible: function (type, startTime, endTime) {
			if (type !== 'task') return false;
			var duration = this.calculateDuration(startTime, endTime);
			return duration > 15;
		},

		/**
		 * Get 30-day marker start time
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {Date} Marker start time
		 */
		get30DayMarkerStart: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			if (duration <= 30) return null;
			
			try {
				var start = new Date(startTime);
				return new Date(start.getTime() + (29 * 24 * 60 * 60 * 1000));
			} catch (error) {
				return null;
			}
		},

		/**
		 * Get 30-day marker end time
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {Date} Marker end time
		 */
		get30DayMarkerEnd: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			if (duration <= 30) return null;
			
			try {
				var start = new Date(startTime);
				return new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000));
			} catch (error) {
				return null;
			}
		},

		/**
		 * Get 30-day marker color
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {string} Marker color or transparent
		 */
		get30DayMarkerColor: function (startTime, endTime) {
			var duration = this.calculateDuration(startTime, endTime);
			return duration > 30 ? '#E15361' : 'transparent';
		},

		/**
		 * Determines if 30-day marker should be visible
		 * @param {string} type - Task type
		 * @param {string} startTime - Start time
		 * @param {string} endTime - End time
		 * @returns {boolean} True if marker should be visible
		 */
		is30DayMarkerVisible: function (type, startTime, endTime) {
			if (type !== 'task') return false;
			var duration = this.calculateDuration(startTime, endTime);
			return duration > 30;
		},

		/**
		 * Get highlight state for Gantt row based on type
		 * @param {string} type - Task type
		 * @returns {string} Highlight state: 'Information' for milestone, 'None' for others
		 */
		getHighlight: function (type) {
			return type === 'milestone' ? 'Information' : 'None';
		},

		/**
		 * Calculates color based on task duration for Gantt chart
		 * @param {any} value - The current value (not used)
		 * @param {object} oContext - The binding context containing the data
		 * @returns {string} Color code based on duration
		 */
		fnDurationColor: function (value, oContext) {
			try {
				// In SAP UI5 formatter, the second parameter is the binding info
				if (oContext && oContext.getModel && oContext.getPath) {
					var model = oContext.getModel();
					var path = oContext.getPath();
					var data = model.getProperty(path);

					if (data && data.startTime && data.endTime) {
						const start = new Date(data.startTime);
						const end = new Date(data.endTime);

						if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
							const diffTime = Math.abs(end - start);
							const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

							if (diffDays > 30) return '#dc3545'; // 红色
							if (diffDays >= 15) return '#ffc107'; // 黄色
							return '#19A979'; // 绿色
						}
					}
				}

				return '#19A979'; // 默认绿色
			} catch (error) {
				console.warn('Error calculating duration color:', error);
				return '#19A979'; // 默认绿色
			}
		}
	};
});
