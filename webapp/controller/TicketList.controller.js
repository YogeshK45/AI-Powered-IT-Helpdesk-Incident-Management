sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "it/helpdesk/incident/model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, formatter, Fragment, MessageToast, JSONModel, Sorter) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.TicketList", {
        formatter: formatter,

        onInit: function () {
            // Nothing specific needed here
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            this._applyFilters(sQuery, this.byId("statusFilter").getSelectedKey());
        },

        onFilterChange: function (oEvent) {
            var sStatus = oEvent.getParameter("selectedItem").getKey();
            this._applyFilters(this.byId("searchField").getValue(), sStatus);
        },

        _applyFilters: function (sSearchQuery, sStatus) {
            var aFilters = [];

            if (sSearchQuery && sSearchQuery.length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Title", FilterOperator.Contains, sSearchQuery),
                        new Filter("TicketID", FilterOperator.Contains, sSearchQuery)
                    ],
                    and: false
                }));
            }

            if (sStatus && sStatus.length > 0) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            var oTable = this.byId("ticketsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters, "Application");
        },

        onSortChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oTable = this.byId("ticketsTable");
            var oBinding = oTable.getBinding("items");
            
            var bDescending = (sKey === "CreatedAt" || sKey === "Priority"); // just simple logic
            oBinding.sort(new Sorter(sKey, bDescending));
        },

        onTicketPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var sTicketId = oItem.getBindingContext("data").getProperty("TicketID");

            this.getOwnerComponent().getRouter().navTo("TicketObject", {
                ticketId: sTicketId
            });
        },

        onCreateTicketPress: function () {
            this.getOwnerComponent().getRouter().navTo("CreateTicket");
        }
    });
});
