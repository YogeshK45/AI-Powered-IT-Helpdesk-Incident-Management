sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "it/helpdesk/incident/model/models",
    "it/helpdesk/incident/service/MockDataService",
    "it/helpdesk/incident/service/knowledgeService",
    "it/helpdesk/incident/service/aiService"
],
function (UIComponent, Device, models, MockDataService, KnowledgeService, AIService) {
    "use strict";

    return UIComponent.extend("it.helpdesk.incident.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Initialize mock data service
            this._oDataService = new MockDataService(this);
            this._oDataService.init();

            this._oKnowledgeService = new KnowledgeService(this._oDataService);
            this._oAIService = new AIService(this._oDataService, this._oKnowledgeService);
        },
        
        getMockDataService: function() {
            return this._oDataService;
        },

        getKnowledgeService: function() {
            return this._oKnowledgeService;
        },

        getAIService: function() {
            return this._oAIService;
        }
    });
});
