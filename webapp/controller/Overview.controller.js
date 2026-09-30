sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "it/helpdesk/incident/model/formatter"
], function (Controller, formatter) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.Overview", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("Overview").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // update KPIs if needed, mock data service already recalculates periodically
            this.getOwnerComponent().getMockDataService().updateKPIs();
        },

        onNavToTickets: function () {
            this.getOwnerComponent().getRouter().navTo("AllTickets");
        },

        onNavToSla: function () {
            this.getOwnerComponent().getRouter().navTo("SlaEscalations");
        },

        onTicketPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("data");
            var sTicketId = oContext.getProperty("TicketID");

            this.getOwnerComponent().getRouter().navTo("TicketObject", {
                ticketId: sTicketId
            });
        }
    });
});
