sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/m/Select",
    "sap/ui/core/Item",
    "it/helpdesk/incident/model/formatter"
], function (Controller, JSONModel, MessageToast, MessageBox, Dialog, Button, Label, Input, TextArea, Select, Item, formatter) {
    "use strict";

    return Controller.extend("it.helpdesk.incident.controller.TicketObject", {
        formatter: formatter,

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("TicketObject").attachPatternMatched(this._onObjectMatched, this);
            
            this.getView().setModel(new JSONModel({}), "view");
            this.getView().setModel(new JSONModel([]), "comments");
            this.getView().setModel(new JSONModel([]), "history");
        },

        _onObjectMatched: function (oEvent) {
            var sTicketId = oEvent.getParameter("arguments").ticketId;
            var oService = this.getOwnerComponent().getMockDataService();
            var oTicket = oService.getTicket(sTicketId);
            
            if (!oTicket) {
                // Ticket not found
                MessageBox.error("Ticket not found.", {
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function () {
                        this.getOwnerComponent().getRouter().navTo("Overview");
                    }.bind(this)
                });
                return;
            }

            var oViewModel = this.getView().getModel("view");
            var oTicketCopy = Object.assign({}, oTicket); // Work with a copy or direct binding
            
            // Calculate SLA strings
            var now = new Date().getTime();
            var created = new Date(oTicket.CreatedAt).getTime();
            var due = new Date(oTicket.DueDate).getTime();
            
            var elapsedMs = now - created;
            var remainingMs = due - now;
            
            var formatMs = function(ms) {
                if (ms < 0) return "0h 0m";
                var h = Math.floor(ms / (1000 * 60 * 60));
                var m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                return h + "h " + m + "m";
            };

            oTicketCopy.SLA = {
                Elapsed: formatMs(elapsedMs),
                Remaining: remainingMs > 0 ? formatMs(remainingMs) : "Breached"
            };

            oViewModel.setData(oTicketCopy);
            
            // Re-init AI state
            oViewModel.setProperty("/ai", { visible: false });

            this._updateActionStates();
            this._loadCommentsAndHistory(sTicketId);
        },

        _updateActionStates: function() {
            var oViewModel = this.getView().getModel("view");
            var sStatus = oViewModel.getProperty("/Status");
            var oActions = {
                Assign: false,
                StartWork: false,
                Resolve: false,
                Close: false,
                Reopen: false
            };

            switch (sStatus) {
                case "NEW":
                    oActions.Assign = true;
                    break;
                case "ASSIGNED":
                    oActions.Assign = true;
                    oActions.StartWork = true;
                    break;
                case "IN_PROGRESS":
                    oActions.Assign = true;
                    oActions.Resolve = true;
                    break;
                case "RESOLVED":
                    oActions.Close = true;
                    oActions.Reopen = true;
                    break;
                case "CLOSED":
                    oActions.Reopen = true;
                    break;
                case "REOPENED":
                    oActions.Assign = true;
                    oActions.StartWork = true;
                    break;
            }

            oViewModel.setProperty("/actions", oActions);
        },

        _loadCommentsAndHistory: function(sTicketId) {
            var oService = this.getOwnerComponent().getMockDataService();
            var aComments = oService.getCommentsForTicket(sTicketId);
            this.getView().getModel("comments").setData(aComments);
            
            var aHistory = oService.getHistoryForTicket(sTicketId);
            this.getView().getModel("history").setData(aHistory);
        },
        
        _refreshData: function() {
            var oViewModel = this.getView().getModel("view");
            var sTicketId = oViewModel.getProperty("/TicketID");
            
            var oService = this.getOwnerComponent().getMockDataService();
            var oTicket = oService.getTicket(sTicketId);
            
            if(oTicket) {
                Object.keys(oTicket).forEach(function(k) {
                    oViewModel.setProperty("/" + k, oTicket[k]);
                });
                this._updateActionStates();
                this._loadCommentsAndHistory(sTicketId);
            }
        },

        onAssign: function () {
            if (!this._oAssignDialog) {
                this._oAssignDialog = new Dialog({
                    title: "Assign Ticket",
                    contentWidth: "400px",
                    content: [
                        new Label({ text: "Support Team", required: true }),
                        new Select("teamSelect", {
                            width: "100%",
                            items: [
                                new Item({ key: "Network Operations", text: "Network Operations" }),
                                new Item({ key: "End User Computing", text: "End User Computing" }),
                                new Item({ key: "SAP Security", text: "SAP Security" }),
                                new Item({ key: "Facilities IT", text: "Facilities IT" }),
                                new Item({ key: "Security Operations", text: "Security Operations" })
                            ]
                        }),
                        new Label({ text: "Assigned To" }),
                        new Input("assigneeInput", { placeholder: "Enter assignee name" })
                    ],
                    beginButton: new Button({
                        type: "Emphasized",
                        text: "Assign",
                        press: function () {
                            var sTeam = sap.ui.getCore().byId("teamSelect").getSelectedKey();
                            var sAssignee = sap.ui.getCore().byId("assigneeInput").getValue();
                            
                            if (!sTeam) {
                                MessageBox.error("Support Team is required.");
                                return;
                            }

                            var sTicketId = this.getView().getModel("view").getProperty("/TicketID");
                            var oService = this.getOwnerComponent().getMockDataService();
                            
                            oService.updateTicketStatus(sTicketId, "ASSIGNED", sAssignee, "USER001", "Assigned to " + sTeam);
                            
                            MessageToast.show("Ticket assigned to " + sTeam);
                            this._refreshData();
                            this._oAssignDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._oAssignDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oAssignDialog);
            }
            this._oAssignDialog.open();
        },

        onStartWork: function () {
            var sTicketId = this.getView().getModel("view").getProperty("/TicketID");
            var oService = this.getOwnerComponent().getMockDataService();
            
            oService.updateTicketStatus(sTicketId, "IN_PROGRESS", undefined, undefined, "Work started");
            
            MessageToast.show("Work has been started on " + sTicketId + ".");
            this._refreshData();
        },

        onResolve: function () {
            if (!this._oResolveDialog) {
                this._oResolveDialog = new Dialog({
                    title: "Resolve Ticket",
                    contentWidth: "400px",
                    content: [
                        new Label({ text: "Resolution", required: true }),
                        new TextArea("resolutionInput", { width: "100%", rows: 3 }),
                        new Label({ text: "Resolution Notes" }),
                        new TextArea("resolutionNotesInput", { width: "100%", rows: 3 })
                    ],
                    beginButton: new Button({
                        type: "Accept",
                        text: "Resolve",
                        press: function () {
                            var sResolution = sap.ui.getCore().byId("resolutionInput").getValue();
                            var sNotes = sap.ui.getCore().byId("resolutionNotesInput").getValue();
                            
                            if (!sResolution.trim()) {
                                MessageBox.error("Resolution is required before resolving the ticket.");
                                return;
                            }

                            var sTicketId = this.getView().getModel("view").getProperty("/TicketID");
                            var oService = this.getOwnerComponent().getMockDataService();
                            var sCurrentUser = oService._oModel.getProperty("/CurrentUser/name");
                            
                            oService.updateTicketStatus(sTicketId, "RESOLVED", undefined, undefined, "Ticket resolved", sCurrentUser, sResolution, sNotes);
                            
                            MessageToast.show("Ticket " + sTicketId + " has been resolved.");
                            this._refreshData();
                            this._oResolveDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._oResolveDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oResolveDialog);
            }
            sap.ui.getCore().byId("resolutionInput").setValue("");
            sap.ui.getCore().byId("resolutionNotesInput").setValue("");
            this._oResolveDialog.open();
        },

        onClose: function () {
            var sTicketId = this.getView().getModel("view").getProperty("/TicketID");
            var oService = this.getOwnerComponent().getMockDataService();
            
            MessageBox.confirm("Are you sure you want to close this ticket?", {
                actions: [MessageBox.Action.CLOSE, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.CLOSE,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.CLOSE) {
                        oService.updateTicketStatus(sTicketId, "CLOSED", undefined, undefined, "Ticket closed by user");
                        MessageToast.show("Ticket " + sTicketId + " has been closed.");
                        this._refreshData();
                    }
                }.bind(this)
            });
        },

        onReopen: function () {
            if (!this._oReopenDialog) {
                this._oReopenDialog = new Dialog({
                    title: "Reopen Ticket",
                    contentWidth: "400px",
                    content: [
                        new Label({ text: "Reason for reopening", required: true }),
                        new TextArea("reopenReasonInput", { width: "100%", rows: 3 })
                    ],
                    beginButton: new Button({
                        type: "Emphasized",
                        text: "Reopen",
                        press: function () {
                            var sReason = sap.ui.getCore().byId("reopenReasonInput").getValue();
                            
                            if (!sReason.trim()) {
                                MessageBox.error("Reason is required before reopening the ticket.");
                                return;
                            }

                            var sTicketId = this.getView().getModel("view").getProperty("/TicketID");
                            var oService = this.getOwnerComponent().getMockDataService();
                            
                            oService.updateTicketStatus(sTicketId, "REOPENED", undefined, undefined, "Reopened: " + sReason);
                            
                            MessageToast.show("Ticket " + sTicketId + " has been reopened.");
                            this._refreshData();
                            this._oReopenDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._oReopenDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oReopenDialog);
            }
            sap.ui.getCore().byId("reopenReasonInput").setValue("");
            this._oReopenDialog.open();
        },

        onAddComment: function () {
            if (!this._oCommentDialog) {
                this._oCommentDialog = new Dialog({
                    title: "Add Comment",
                    contentWidth: "400px",
                    content: [
                        new Label({ text: "Comment", required: true }),
                        new TextArea("commentInput", { width: "100%", rows: 4 })
                    ],
                    beginButton: new Button({
                        type: "Emphasized",
                        text: "Add",
                        press: function () {
                            var sComment = sap.ui.getCore().byId("commentInput").getValue();
                            
                            if (!sComment.trim()) {
                                MessageBox.error("Comment cannot be empty.");
                                return;
                            }

                            var sTicketId = this.getView().getModel("view").getProperty("/TicketID");
                            var oService = this.getOwnerComponent().getMockDataService();
                            
                            oService.addComment(sTicketId, sComment);
                            
                            MessageToast.show("Comment added.");
                            this._loadCommentsAndHistory(sTicketId);
                            this._oCommentDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            this._oCommentDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oCommentDialog);
            }
            sap.ui.getCore().byId("commentInput").setValue("");
            this._oCommentDialog.open();
        },

        onAnalyzeAI: function (oEvent) {
            var oBtn = this.byId("btnAnalyzeAI");
            oBtn.setBusy(true);
            
            var oViewModel = this.getView().getModel("view");
            var sDesc = oViewModel.getProperty("/Description");
            var sTicketId = oViewModel.getProperty("/TicketID");
            var oAIService = this.getOwnerComponent().getAIService();

            oAIService.analyzeIncident(sDesc, sTicketId).then(function(result) {
                oBtn.setBusy(false);
                oViewModel.setProperty("/ai/AIClassification", result.AIClassification);
                oViewModel.setProperty("/ai/AIRecommendedPriority", result.AIRecommendedPriority);
                oViewModel.setProperty("/ai/AIRecommendedTeam", result.AIRecommendedTeam);
                oViewModel.setProperty("/ai/AISummary", result.AISummary);
                oViewModel.setProperty("/ai/AIResolution", result.AIResolution);
                
                oViewModel.setProperty("/ai/SimilarIncidents", result.SimilarIncidents);
                oViewModel.setProperty("/ai/KnowledgeSources", result.KnowledgeSources);

                oViewModel.setProperty("/ai/visible", true);
                
                oAIService.logAnalysis(sTicketId, result);
                
                MessageToast.show("AI Analysis complete");
            }).catch(function() {
                oBtn.setBusy(false);
                MessageBox.error("AI analysis is currently unavailable. Please try again.");
            });
        },

        onApplyAIPriority: function() {
            var oViewModel = this.getView().getModel("view");
            var sPriority = oViewModel.getProperty("/ai/AIRecommendedPriority");
            var sTicketId = oViewModel.getProperty("/TicketID");
            
            var oService = this.getOwnerComponent().getMockDataService();
            var aTickets = oService._oModel.getProperty("/Tickets");
            var oTicket = aTickets.find(function(t) { return t.TicketID === sTicketId; });
            if (oTicket) {
                oTicket.Priority = sPriority;
                oService._oModel.setProperty("/Tickets", aTickets);
                oService.recalculateSLAs();
                MessageToast.show("Priority updated to " + sPriority);
                this._refreshData();
            }
        },

        onApplyAITeam: function() {
            var oViewModel = this.getView().getModel("view");
            var sTeam = oViewModel.getProperty("/ai/AIRecommendedTeam");
            var sTicketId = oViewModel.getProperty("/TicketID");
            
            var oService = this.getOwnerComponent().getMockDataService();
            var aTickets = oService._oModel.getProperty("/Tickets");
            var oTicket = aTickets.find(function(t) { return t.TicketID === sTicketId; });
            if (oTicket) {
                oTicket.SupportTeam = sTeam;
                oService._oModel.setProperty("/Tickets", aTickets);
                MessageToast.show("Support Team updated to " + sTeam);
                this._refreshData();
            }
        }
    });
});
