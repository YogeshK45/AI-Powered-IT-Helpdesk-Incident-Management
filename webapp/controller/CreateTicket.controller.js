sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, MessageBox, History) {
    "use strict";

    var CATEGORY_MAP = {
        "Network": ["LAN", "Connectivity", "DNS", "Routing"],
        "VPN": ["VPN Authentication", "VPN Connectivity", "VPN Client"],
        "SAP": ["SAP Login", "Transaction Error", "System Access"],
        "SAP Security": ["Authorization", "Role Assignment", "Access Request"],
        "Hardware": ["Laptop", "Desktop", "Monitor", "Keyboard"],
        "Software": ["Installation", "Application Crash", "License"],
        "Email": ["Mailbox", "Outlook", "Email Delivery"],
        "Printer": ["Printer Offline", "Print Queue", "Toner"],
        "Security": ["Malware", "Phishing", "Data Breach"],
        "Access Management": ["Password Reset", "New Account", "Account Lockout"]
    };

    var TEAM_MAP = {
        "Network Operations": ["Rahul Sharma", "Amit Verma"],
        "SAP Support": ["Neha Singh", "Vikas Kumar"],
        "SAP Security": ["Priya Sharma", "Arjun Mehta"],
        "End User Computing": ["Amit Verma", "Rohit Singh"],
        "Enterprise Applications": ["Karan Gupta", "Pooja Patel"],
        "Enterprise Messaging": ["Suresh Das", "Neha Singh"],
        "IT Security": ["Vikram Reddy", "Arjun Mehta"],
        "Service Desk": ["System Admin", "Helpdesk Agent"]
    };

    var PRIORITY_SLA = {
        "Critical": "4 Hours",
        "High": "8 Hours",
        "Medium": "24 Hours",
        "Low": "48 Hours"
    };

    return Controller.extend("it.helpdesk.incident.controller.CreateTicket", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("CreateTicket").attachPatternMatched(this._onRouteMatched, this);

            // Lookup Data
            var aCategories = Object.keys(CATEGORY_MAP).map(function(k) { return {key: k, text: k}; });
            var aTeams = Object.keys(TEAM_MAP).map(function(k) { return {key: k, text: k}; });
            
            this.getView().setModel(new JSONModel({
                Categories: aCategories,
                SubCategories: [],
                Teams: aTeams,
                Agents: []
            }), "lookup");

            this.getView().setModel(new JSONModel({}), "draft");
            this.getView().setModel(new JSONModel({ visible: false }), "ai");
            
            this._bIsDirty = false;
        },

        _onRouteMatched: function () {
            this._resetForm();
        },

        _resetForm: function () {
            this._bIsDirty = false;
            this.getView().getModel("draft").setData({
                Title: "",
                Description: "",
                Category: "",
                SubCategory: "",
                Priority: "Medium",
                SLATargetDisplay: PRIORITY_SLA["Medium"],
                Requester: "System Admin",
                RequesterEmail: "admin@company.com",
                RequesterDepartment: "IT Operations",
                SupportTeam: "",
                AssignedTo: ""
            });
            this.getView().getModel("ai").setData({ visible: false });
            this.getView().getModel("lookup").setProperty("/SubCategories", []);
            this.getView().getModel("lookup").setProperty("/Agents", []);
            
            // Clear value states
            ["titleInput", "descInput", "categoryCombo", "requesterInput"].forEach(function(sId) {
                var oControl = this.byId(sId);
                if (oControl) oControl.setValueState("None");
            }.bind(this));
        },

        onFormChange: function() {
            this._bIsDirty = true;
        },

        onCategoryChange: function (oEvent) {
            this._bIsDirty = true;
            var sCat = this.getView().getModel("draft").getProperty("/Category");
            var aSub = CATEGORY_MAP[sCat] || [];
            this.getView().getModel("lookup").setProperty("/SubCategories", aSub.map(function(s) { return {key: s, text: s}; }));
            this.getView().getModel("draft").setProperty("/SubCategory", "");
            if (this.byId("categoryCombo")) this.byId("categoryCombo").setValueState("None");
        },

        onPriorityChange: function (oEvent) {
            this._bIsDirty = true;
            var sPri = this.getView().getModel("draft").getProperty("/Priority");
            this.getView().getModel("draft").setProperty("/SLATargetDisplay", PRIORITY_SLA[sPri]);
        },

        onTeamChange: function (oEvent) {
            this._bIsDirty = true;
            var sTeam = this.getView().getModel("draft").getProperty("/SupportTeam");
            var aAgents = TEAM_MAP[sTeam] || [];
            this.getView().getModel("lookup").setProperty("/Agents", aAgents.map(function(s) { return {key: s, text: s}; }));
            this.getView().getModel("draft").setProperty("/AssignedTo", "");
        },

        onAnalyzeAI: function () {
            var sDesc = this.getView().getModel("draft").getProperty("/Description");
            if (!sDesc) {
                MessageBox.warning("Please enter a description to analyze.");
                return;
            }

            var oBtn = this.byId("btnAnalyzeAI");
            oBtn.setBusy(true);

            var oAIService = this.getOwnerComponent().getAIService();

            oAIService.analyzeIncident(sDesc).then(function(result) {
                oBtn.setBusy(false);
                this.getView().getModel("ai").setData({
                    visible: true,
                    SuggestedCategory: result.AIClassification,
                    SuggestedPriority: result.AIRecommendedPriority,
                    SuggestedTeam: result.AIRecommendedTeam
                });
            }.bind(this)).catch(function() {
                oBtn.setBusy(false);
                MessageBox.error("AI analysis is currently unavailable. Please try again.");
            });
        },

        onApplyRecommendations: function () {
            var oAiData = this.getView().getModel("ai").getData();
            var oDraft = this.getView().getModel("draft");
            
            oDraft.setProperty("/Category", oAiData.SuggestedCategory);
            this.onCategoryChange(); // Trigger dependent update
            
            oDraft.setProperty("/Priority", oAiData.SuggestedPriority);
            this.onPriorityChange();
            
            oDraft.setProperty("/SupportTeam", oAiData.SuggestedTeam);
            this.onTeamChange();

            this.getView().getModel("ai").setProperty("/visible", false);
            MessageToast.show("Recommendations applied.");
        },

        onCancel: function () {
            var sTitle = this.getView().getModel("draft").getProperty("/Title");
            var sDesc = this.getView().getModel("draft").getProperty("/Description");

            if (sTitle || sDesc || this._bIsDirty) {
                MessageBox.confirm("Unsaved changes will be lost. Do you want to continue?", {
                    title: "Discard this ticket?",
                    actions: ["Leave", "Stay"],
                    emphasizedAction: "Stay",
                    onClose: function (sAction) {
                        if (sAction === "Leave") {
                            this._navBack();
                        }
                    }.bind(this)
                });
            } else {
                this._navBack();
            }
        },

        _navBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("AllTickets", {}, true);
            }
        },

        onCreate: function () {
            var oDraft = this.getView().getModel("draft").getData();
            var bValid = true;

            // Validate
            if (!oDraft.Title) {
                this.byId("titleInput").setValueState("Error").setValueStateText("Title is required.");
                bValid = false;
            }
            if (!oDraft.Description) {
                this.byId("descInput").setValueState("Error").setValueStateText("Please provide a description of the incident.");
                bValid = false;
            }
            if (!oDraft.Category) {
                this.byId("categoryCombo").setValueState("Error").setValueStateText("Please select a category.");
                bValid = false;
            }
            if (!oDraft.Requester) {
                this.byId("requesterInput").setValueState("Error").setValueStateText("Please select the requester.");
                bValid = false;
            }

            if (!bValid) {
                MessageBox.error("Please fill in all required fields.");
                return;
            }

            var oService = this.getOwnerComponent().getMockDataService();
            
            // The service creates a NEW ticket natively if passed data.
            // Let's pass what we need. MockDataService generates ID and timestamps.
            var sNewId = oService.createTicket({
                Title: oDraft.Title,
                Description: oDraft.Description,
                Category: oDraft.Category,
                SubCategory: oDraft.SubCategory,
                Priority: oDraft.Priority,
                Requester: oDraft.Requester,
                RequesterEmail: oDraft.RequesterEmail,
                RequesterDepartment: oDraft.RequesterDepartment,
                SupportTeam: oDraft.SupportTeam,
                AssignedTo: oDraft.AssignedTo,
                AssignedToUserID: oDraft.AssignedTo === "System Admin" ? "ADMIN001" : ""
            });

            this._bIsDirty = false;
            
            MessageBox.success("Ticket " + sNewId + " has been created successfully.", {
                onClose: function() {
                    this.getOwnerComponent().getRouter().navTo("TicketObject", {
                        ticketId: sNewId
                    });
                }.bind(this)
            });
        }
    });
});
