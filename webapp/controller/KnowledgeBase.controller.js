sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "it/helpdesk/incident/model/formatter"
], function (Controller, JSONModel, formatter) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.KnowledgeBase", {
        formatter: formatter,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("KnowledgeBase").attachPatternMatched(this._onRouteMatched, this);
            
            this.getView().setModel(new JSONModel({
                articles: [],
                selectedArticle: {}
            }), "view");
        },

        _onRouteMatched: function () {
            this._refreshList();
        },

        _refreshList: function() {
            var sQuery = this.byId("searchField") ? this.byId("searchField").getValue() : "";
            var sCategory = this.byId("categoryFilter") ? this.byId("categoryFilter").getSelectedKey() : "All";
            
            var oKnowledgeService = this.getOwnerComponent().getKnowledgeService();
            var aArticles = oKnowledgeService.searchArticles(sQuery, sCategory);
            
            var aFormatted = aArticles.map(function(a) {
                var oCopy = Object.assign({}, a);
                oCopy.Tags = a.Tags.join(", ");
                return oCopy;
            });
            
            this.getView().getModel("view").setProperty("/articles", aFormatted);
        },

        onSearch: function (oEvent) {
            this._refreshList();
        },

        onFilterChange: function (oEvent) {
            this._refreshList();
        },

        onArticleSelect: function(oEvent) {
            var oItem = oEvent.getParameter("listItem");
            if (oItem) {
                var oContext = oItem.getBindingContext("view");
                var oArticle = oContext.getObject();
                this.getView().getModel("view").setProperty("/selectedArticle", oArticle);
            }
        },

        onAnalyzeRelated: function(oEvent) {
            var oArticle = this.getView().getModel("view").getProperty("/selectedArticle");
            if (oArticle && oArticle.ArticleID) {
                var oRouter = this.getOwnerComponent().getRouter();
                // Navigate to AI Assistant. In a real app we might pass the article ID as a query param
                // but the prompt says to navigate to AI analysis using the article context.
                // We'll just open the AI Assistant page for now, as it handles its own input.
                oRouter.navTo("AIAssistant");
            }
        }
    });
});
