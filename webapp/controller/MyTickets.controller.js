sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "it/helpdesk/incident/model/formatter",
    "sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, formatter, Sorter) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.MyTickets", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("MyTickets").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function() {
            var sCurrentUser = this.getOwnerComponent().getModel("data").getProperty("/CurrentUser/Name");
            var oTable = this.byId("myTicketsTable");
            var oBinding = oTable.getBinding("items");
            
            var oFilter = new Filter("AssignedTo", FilterOperator.EQ, sCurrentUser);
            oBinding.filter([oFilter]);
        },

        onTicketPress: function (oEvent) {
            var sTicketId = oEvent.getSource().getBindingContext("data").getProperty("TicketID");
            this.getOwnerComponent().getRouter().navTo("TicketObject", {
                ticketId: sTicketId
            });
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            this._applyFilters(sQuery, this.byId("statusFilter").getSelectedKey());
        },

        onFilterChange: function (oEvent) {
            var sStatus = oEvent.getParameter("selectedItem").getKey();
            this._applyFilters(this.byId("searchField").getValue(), sStatus);
        },

        _applyFilters: function (sQuery, sStatus) {
            var aFilters = [];
            // Base filter for MyTickets
            aFilters.push(new Filter("AssignedToUserID", FilterOperator.EQ, "ADMIN001"));
            
            if (sQuery) {
                var oSearchFilter = new Filter({
                    filters: [
                        new Filter("TicketID", FilterOperator.Contains, sQuery),
                        new Filter("Title", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }

            var oTable = this.byId("myTicketsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters, "Application");
        },

        onSortChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oTable = this.byId("myTicketsTable");
            var oBinding = oTable.getBinding("items");
            
            var bDescending = (sKey === "Priority");
            oBinding.sort(new Sorter(sKey, bDescending));
        }
    });
});
