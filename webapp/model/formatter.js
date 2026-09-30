sap.ui.define([], function () {
    "use strict";

    return {
        statusState: function (sStatus) {
            switch (sStatus) {
                case "NEW":
                    return "Information";
                case "ASSIGNED":
                    return "Information";
                case "IN_PROGRESS":
                    return "Warning";
                case "RESOLVED":
                    return "Success";
                case "CLOSED":
                    return "Success";
                case "REOPENED":
                    return "Error";
                default:
                    return "None";
            }
        },

        statusText: function (sStatus) {
            switch (sStatus) {
                case "NEW": return "New";
                case "ASSIGNED": return "Assigned";
                case "IN_PROGRESS": return "In Progress";
                case "RESOLVED": return "Resolved";
                case "CLOSED": return "Closed";
                case "REOPENED": return "Reopened";
                default: return sStatus;
            }
        },

        priorityState: function (sPriority) {
            switch (sPriority) {
                case "Critical": return "Error";
                case "High": return "Warning";
                case "Medium": return "Information";
                case "Low": return "Success";
                default: return "None";
            }
        },

        slaState: function (sSlaStatus) {
            switch (sSlaStatus) {
                case "WITHIN_SLA": return "Success";
                case "AT_RISK": return "Warning";
                case "BREACHED": return "Error";
                case "MET": return "Success";
                default: return "None";
            }
        },

        slaText: function (sSlaStatus) {
            switch (sSlaStatus) {
                case "WITHIN_SLA": return "Within SLA";
                case "AT_RISK": return "At Risk";
                case "BREACHED": return "Breached";
                case "MET": return "SLA Met";
                default: return sSlaStatus;
            }
        },

        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDate = new Date(sDate);
            var oOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return oDate.toLocaleDateString('en-US', oOptions);
        },

        escalationLevel: function(sPriority, sSlaStatus) {
            if (sSlaStatus === "BREACHED") {
                return sPriority === "Critical" ? "Level 3" : "Level 2";
            } else if (sSlaStatus === "AT_RISK") {
                return sPriority === "Critical" ? "Level 2" : "Level 1";
            }
            return "Level 1";
        },

        escalationState: function(sLevel) {
            switch(sLevel) {
                case "Level 3": return "Error";
                case "Level 2": return "Warning";
                case "Level 1": return "Information";
                default: return "None";
            }
        }
    };
});
