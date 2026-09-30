sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.App", {
        onInit: function () {
            // App initialization
        },

        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
            oToolPage.setSideExpanded(!bSideExpanded);
        },

        onItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oRouter = this.getOwnerComponent().getRouter();

            switch (sKey) {
                case "overview":
                    oRouter.navTo("Overview");
                    break;
                case "tickets":
                    oRouter.navTo("AllTickets");
                    break;
                case "mytickets":
                    oRouter.navTo("MyTickets");
                    break;
                case "sla":
                    oRouter.navTo("SlaEscalations");
                    break;
                case "kb":
                    oRouter.navTo("KnowledgeBase");
                    break;
                case "ai":
                    oRouter.navTo("AIAssistant");
                    break;
            }
        }
    });
});
