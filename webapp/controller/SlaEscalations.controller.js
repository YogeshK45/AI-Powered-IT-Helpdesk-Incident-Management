sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "it/helpdesk/incident/model/formatter",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, formatter, MessageToast) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.SlaEscalations", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("SlaEscalations").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function() {
            var oTable = this.byId("slaTable");
            var oBinding = oTable.getBinding("items");
            
            // Filter: (Priority=Critical OR SLAStatus=BREACHED OR SLAStatus=AT_RISK) AND Status != RESOLVED AND Status != CLOSED
            var oFilterPriority = new Filter("Priority", FilterOperator.EQ, "Critical");
            var oFilterBreached = new Filter("SLAStatus", FilterOperator.EQ, "BREACHED");
            var oFilterRisk = new Filter("SLAStatus", FilterOperator.EQ, "AT_RISK");
            
            var oStatusNotResolved = new Filter("Status", FilterOperator.NE, "RESOLVED");
            var oStatusNotClosed = new Filter("Status", FilterOperator.NE, "CLOSED");
            
            var oOrFilters = new Filter({
                filters: [oFilterPriority, oFilterBreached, oFilterRisk],
                and: false
            });

            var oFinalFilter = new Filter({
                filters: [oOrFilters, oStatusNotResolved, oStatusNotClosed],
                and: true
            });

            oBinding.filter([oFinalFilter]);
        },

        onTicketPress: function (oEvent) {
            var sTicketId = oEvent.getSource().getBindingContext("data").getProperty("TicketID");
            this.getOwnerComponent().getRouter().navTo("TicketObject", {
                ticketId: sTicketId
            });
        },
        
        onEscalatePress: function(oEvent) {
            var oItem = oEvent.getSource().getParent();
            var sTicketId = oItem.getBindingContext("data").getProperty("TicketID");
            
            var oService = this.getOwnerComponent().getMockDataService();
            if (oService.escalateTicket(sTicketId)) {
                MessageToast.show("Ticket " + sTicketId + " escalated successfully.");
            }
        }
    });
});
