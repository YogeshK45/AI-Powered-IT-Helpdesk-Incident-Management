sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "it/helpdesk/incident/model/formatter"
], function (Controller, JSONModel, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.AIAssistant", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("AIAssistant").attachPatternMatched(this._onRouteMatched, this);
            
            this.getView().setModel(new JSONModel({
                incidentText: "",
                selectedTicketId: "",
                ai: { visible: false },
                recentAnalyses: []
            }), "view");
        },

        _onRouteMatched: function () {
            // Load ticket list
            var aTickets = this.getOwnerComponent().getMockDataService()._oModel.getProperty("/Tickets");
            this.getView().setModel(new JSONModel(aTickets), "tickets");
            
            this._refreshRecent();
        },
        
        _refreshRecent: function() {
            var oAIService = this.getOwnerComponent().getAIService();
            this.getView().getModel("view").setProperty("/recentAnalyses", oAIService.getRecentAnalyses());
        },

        onTicketSelect: function(oEvent) {
            var sTicketId = oEvent.getParameter("selectedItem").getKey();
            if (sTicketId) {
                var oTicket = this.getOwnerComponent().getMockDataService().getTicket(sTicketId);
                if (oTicket) {
                    var sDesc = "Title: " + oTicket.Title + "\nDescription: " + oTicket.Description + "\nCategory: " + oTicket.Category + "\nPriority: " + oTicket.Priority;
                    this.getView().getModel("view").setProperty("/incidentText", sDesc);
                    this.getView().getModel("view").setProperty("/selectedTicketId", sTicketId);
                }
            } else {
                this.getView().getModel("view").setProperty("/incidentText", "");
                this.getView().getModel("view").setProperty("/selectedTicketId", "");
            }
        },

        onClear: function() {
            this.getView().getModel("view").setProperty("/incidentText", "");
            this.getView().getModel("view").setProperty("/selectedTicketId", "");
            this.getView().getModel("view").setProperty("/ai/visible", false);
            this.byId("ticketSelect").setSelectedKey("");
        },

        onAnalyze: function () {
            var sDesc = this.getView().getModel("view").getProperty("/incidentText");
            if (!sDesc) {
                MessageBox.warning("Please describe the incident first.");
                return;
            }

            var oBtn = this.byId("btnAnalyze");
            oBtn.setBusy(true);

            var oAIService = this.getOwnerComponent().getAIService();
            var sTicketId = this.getView().getModel("view").getProperty("/selectedTicketId");

            oAIService.analyzeIncident(sDesc, sTicketId).then(function(result) {
                oBtn.setBusy(false);
                var oViewModel = this.getView().getModel("view");
                
                oViewModel.setProperty("/ai", result);
                oViewModel.setProperty("/ai/visible", true);
                
                oAIService.logAnalysis(sTicketId, result);
                this._refreshRecent();
                
                MessageToast.show("Analysis complete.");
            }.bind(this)).catch(function(e) {
                oBtn.setBusy(false);
                MessageBox.error("AI analysis is currently unavailable. Please try again.");
            });
        },

        onSimilarIncidentPress: function(oEvent) {
            var sTicketId = oEvent.getSource().getBindingContext("view").getProperty("TicketID");
            this.getOwnerComponent().getRouter().navTo("TicketObject", {
                ticketId: sTicketId
            });
        }
    });
});
