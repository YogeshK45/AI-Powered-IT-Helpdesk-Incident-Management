sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel"
], function (ManagedObject, JSONModel) {
    "use strict";

    return ManagedObject.extend("it.helpdesk.incident.service.MockDataService", {
        constructor: function (oComponent) {
            this._oComponent = oComponent;
        },

        init: function () {
            var now = new Date().getTime();
            var hour = 60 * 60 * 1000;
            
            var oData = {
                Tickets: [
                    {
                        TicketID: "INC-10024",
                        Title: "VPN Connectivity Issue",
                        Description: "User is unable to establish reliable VPN connectivity and cannot access internal SAP applications since morning.",
                        Category: "Network",
                        SubCategory: "VPN",
                        Priority: "High",
                        Status: "IN_PROGRESS",
                        Requester: "Rajesh Kumar",
                        RequesterEmail: "rajesh.kumar@enterprise.com",
                        RequesterDepartment: "Sales",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "Network Operations",
                        CreatedAt: new Date(now - 2 * hour).toISOString(),
                        UpdatedAt: new Date(now - 1 * hour).toISOString(),
                        DueDate: new Date(now + 6 * hour).toISOString(),
                        SLAStatus: "WITHIN_SLA",
                        SLATargetHours: 8,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10025",
                        Title: "SAP Authorization Failure",
                        Description: "Getting authorization failure when trying to execute transaction ME21N.",
                        Category: "SAP",
                        SubCategory: "Security",
                        Priority: "Critical",
                        Status: "NEW",
                        Requester: "Anita Desai",
                        RequesterEmail: "anita.desai@enterprise.com",
                        RequesterDepartment: "Procurement",
                        AssignedTo: "",
                        AssignedToUserID: "",
                        SupportTeam: "SAP Security",
                        CreatedAt: new Date(now - 5 * hour).toISOString(),
                        UpdatedAt: new Date(now - 5 * hour).toISOString(),
                        DueDate: new Date(now - 1 * hour).toISOString(),
                        SLAStatus: "BREACHED",
                        SLATargetHours: 4,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 2"
                    },
                    {
                        TicketID: "INC-10026",
                        Title: "Laptop Performance Issue",
                        Description: "System is extremely slow and freezing frequently.",
                        Category: "Hardware",
                        SubCategory: "Laptop",
                        Priority: "Medium",
                        Status: "ASSIGNED",
                        Requester: "Suresh Menon",
                        RequesterEmail: "suresh.menon@enterprise.com",
                        RequesterDepartment: "Engineering",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "End User Computing",
                        CreatedAt: new Date(now - 10 * hour).toISOString(),
                        UpdatedAt: new Date(now - 2 * hour).toISOString(),
                        DueDate: new Date(now + 14 * hour).toISOString(),
                        SLAStatus: "WITHIN_SLA",
                        SLATargetHours: 24,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10027",
                        Title: "Cannot access SharePoint",
                        Description: "SharePoint site is loading very slow or timing out.",
                        Category: "Software",
                        SubCategory: "O365",
                        Priority: "Medium",
                        Status: "RESOLVED",
                        Requester: "Priya Singh",
                        RequesterEmail: "priya.singh@enterprise.com",
                        RequesterDepartment: "Marketing",
                        AssignedTo: "Neha Patel",
                        AssignedToUserID: "NPATEL",
                        SupportTeam: "Collaboration Team",
                        CreatedAt: new Date(now - 48 * hour).toISOString(),
                        UpdatedAt: new Date(now - 1 * hour).toISOString(),
                        DueDate: new Date(now - 24 * hour).toISOString(),
                        SLAStatus: "MET",
                        SLATargetHours: 24,
                        Resolution: "Restarted backend service",
                        ResolutionNotes: "Cleared cache and restarted the indexing service which caused the lockup.",
                        ResolvedAt: new Date(now - 2 * hour).toISOString(),
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10028",
                        Title: "Printer out of toner",
                        Description: "3rd floor main printer needs toner replacement.",
                        Category: "Hardware",
                        SubCategory: "Printer",
                        Priority: "Low",
                        Status: "NEW",
                        Requester: "Vikram Bose",
                        RequesterEmail: "vikram.bose@enterprise.com",
                        RequesterDepartment: "Facilities",
                        AssignedTo: "",
                        AssignedToUserID: "",
                        SupportTeam: "Facilities IT",
                        CreatedAt: new Date(now - 40 * hour).toISOString(),
                        UpdatedAt: new Date(now - 40 * hour).toISOString(),
                        DueDate: new Date(now + 8 * hour).toISOString(),
                        SLAStatus: "AT_RISK",
                        SLATargetHours: 48,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10029",
                        Title: "Outlook not syncing",
                        Description: "Emails are not coming in on my mobile device.",
                        Category: "Email",
                        SubCategory: "Mobile",
                        Priority: "Medium",
                        Status: "ASSIGNED",
                        Requester: "Ravi Kumar",
                        RequesterEmail: "ravi.kumar@enterprise.com",
                        RequesterDepartment: "Sales",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "End User Computing",
                        CreatedAt: new Date(now - 20 * hour).toISOString(),
                        UpdatedAt: new Date(now - 2 * hour).toISOString(),
                        DueDate: new Date(now + 4 * hour).toISOString(),
                        SLAStatus: "AT_RISK",
                        SLATargetHours: 24,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10030",
                        Title: "SAP Login Issue",
                        Description: "Password reset required for SAP GUI.",
                        Category: "SAP Security",
                        SubCategory: "Access",
                        Priority: "High",
                        Status: "IN_PROGRESS",
                        Requester: "Sita Sharma",
                        RequesterEmail: "sita.sharma@enterprise.com",
                        RequesterDepartment: "Finance",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "SAP Security",
                        CreatedAt: new Date(now - 7 * hour).toISOString(),
                        UpdatedAt: new Date(now - 1 * hour).toISOString(),
                        DueDate: new Date(now + 1 * hour).toISOString(),
                        SLAStatus: "AT_RISK",
                        SLATargetHours: 8,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10031",
                        Title: "Missing Access to Shared Drive",
                        Description: "Need access to the HR confidential folder.",
                        Category: "Access Management",
                        SubCategory: "Folder",
                        Priority: "Medium",
                        Status: "NEW",
                        Requester: "Arjun Reddy",
                        RequesterEmail: "arjun.reddy@enterprise.com",
                        RequesterDepartment: "HR",
                        AssignedTo: "",
                        AssignedToUserID: "",
                        SupportTeam: "Security Operations",
                        CreatedAt: new Date(now - 2 * hour).toISOString(),
                        UpdatedAt: new Date(now - 2 * hour).toISOString(),
                        DueDate: new Date(now + 22 * hour).toISOString(),
                        SLAStatus: "WITHIN_SLA",
                        SLATargetHours: 24,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10032",
                        Title: "Server Down",
                        Description: "Production database server is unreachable.",
                        Category: "Network",
                        SubCategory: "Server",
                        Priority: "Critical",
                        Status: "IN_PROGRESS",
                        Requester: "Database Admin",
                        RequesterEmail: "dba@enterprise.com",
                        RequesterDepartment: "IT",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "Network Operations",
                        CreatedAt: new Date(now - 3 * hour).toISOString(),
                        UpdatedAt: new Date(now - 0.5 * hour).toISOString(),
                        DueDate: new Date(now + 1 * hour).toISOString(),
                        SLAStatus: "AT_RISK",
                        SLATargetHours: 4,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 2"
                    },
                    {
                        TicketID: "INC-10033",
                        Title: "Monitor flickering",
                        Description: "Secondary monitor keeps blinking on and off.",
                        Category: "Hardware",
                        SubCategory: "Monitor",
                        Priority: "Low",
                        Status: "RESOLVED",
                        Requester: "Geeta Patel",
                        RequesterEmail: "geeta.patel@enterprise.com",
                        RequesterDepartment: "Design",
                        AssignedTo: "Amit Verma",
                        AssignedToUserID: "AVERMA",
                        SupportTeam: "End User Computing",
                        CreatedAt: new Date(now - 20 * hour).toISOString(),
                        UpdatedAt: new Date(now - 5 * hour).toISOString(),
                        DueDate: new Date(now + 28 * hour).toISOString(),
                        SLAStatus: "MET",
                        SLATargetHours: 48,
                        Resolution: "Replaced HDMI cable.",
                        ResolutionNotes: "Cable was faulty.",
                        ResolvedAt: new Date(now - 5 * hour).toISOString(),
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10034",
                        Title: "Adobe Acrobat License Expiry",
                        Description: "Need license renewal for Acrobat Pro.",
                        Category: "Software",
                        SubCategory: "License",
                        Priority: "Medium",
                        Status: "CLOSED",
                        Requester: "Karan Singh",
                        RequesterEmail: "karan.singh@enterprise.com",
                        RequesterDepartment: "Legal",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "Software Asset Management",
                        CreatedAt: new Date(now - 100 * hour).toISOString(),
                        UpdatedAt: new Date(now - 50 * hour).toISOString(),
                        DueDate: new Date(now - 76 * hour).toISOString(),
                        SLAStatus: "MET",
                        SLATargetHours: 24,
                        Resolution: "Assigned new license from pool.",
                        ResolutionNotes: "Verified approval and assigned.",
                        ResolvedAt: new Date(now - 80 * hour).toISOString(),
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10035",
                        Title: "Firewall rule request",
                        Description: "Open port 443 for new external vendor IP.",
                        Category: "Security",
                        SubCategory: "Firewall",
                        Priority: "High",
                        Status: "REOPENED",
                        Requester: "DevOps Team",
                        RequesterEmail: "devops@enterprise.com",
                        RequesterDepartment: "Engineering",
                        AssignedTo: "Network Sec",
                        AssignedToUserID: "NWSEC",
                        SupportTeam: "Security Operations",
                        CreatedAt: new Date(now - 48 * hour).toISOString(),
                        UpdatedAt: new Date(now - 1 * hour).toISOString(),
                        DueDate: new Date(now - 40 * hour).toISOString(),
                        SLAStatus: "BREACHED",
                        SLATargetHours: 8,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 3"
                    },
                    {
                        TicketID: "INC-10036",
                        Title: "Cannot print to color printer",
                        Description: "Getting error code 49 when trying to print.",
                        Category: "Printer",
                        SubCategory: "Error",
                        Priority: "Medium",
                        Status: "NEW",
                        Requester: "Pooja Sharma",
                        RequesterEmail: "pooja.sharma@enterprise.com",
                        RequesterDepartment: "Marketing",
                        AssignedTo: "",
                        AssignedToUserID: "",
                        SupportTeam: "Facilities IT",
                        CreatedAt: new Date(now - 22 * hour).toISOString(),
                        UpdatedAt: new Date(now - 22 * hour).toISOString(),
                        DueDate: new Date(now + 2 * hour).toISOString(),
                        SLAStatus: "AT_RISK",
                        SLATargetHours: 24,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10037",
                        Title: "Suspicious email received",
                        Description: "Received an email asking for password reset, looks like phishing.",
                        Category: "Security",
                        SubCategory: "Phishing",
                        Priority: "High",
                        Status: "IN_PROGRESS",
                        Requester: "Sunil Gupta",
                        RequesterEmail: "sunil.gupta@enterprise.com",
                        RequesterDepartment: "Finance",
                        AssignedTo: "System Admin",
                        AssignedToUserID: "ADMIN001",
                        SupportTeam: "Security Operations",
                        CreatedAt: new Date(now - 1 * hour).toISOString(),
                        UpdatedAt: new Date(now - 0.5 * hour).toISOString(),
                        DueDate: new Date(now + 7 * hour).toISOString(),
                        SLAStatus: "WITHIN_SLA",
                        SLATargetHours: 8,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    },
                    {
                        TicketID: "INC-10038",
                        Title: "Request for new laptop",
                        Description: "Current laptop is 4 years old.",
                        Category: "Hardware",
                        SubCategory: "Replacement",
                        Priority: "Low",
                        Status: "NEW",
                        Requester: "Vikas Jain",
                        RequesterEmail: "vikas.jain@enterprise.com",
                        RequesterDepartment: "Sales",
                        AssignedTo: "",
                        AssignedToUserID: "",
                        SupportTeam: "End User Computing",
                        CreatedAt: new Date(now - 2 * hour).toISOString(),
                        UpdatedAt: new Date(now - 2 * hour).toISOString(),
                        DueDate: new Date(now + 46 * hour).toISOString(),
                        SLAStatus: "WITHIN_SLA",
                        SLATargetHours: 48,
                        Resolution: "",
                        ResolutionNotes: "",
                        EscalationLevel: "Level 1"
                    }
                ],
                Comments: [
                    {
                        CommentID: "COM-001",
                        TicketID: "INC-10024",
                        Author: "System Admin",
                        AuthorUserID: "ADMIN001",
                        CommentText: "I am looking into the firewall logs.",
                        CreatedAt: new Date(now - 1 * hour).toISOString(),
                        CommentType: "Tech"
                    }
                ],
                KnowledgeBase: [
                    {
                        ArticleID: "KB-1001",
                        Title: "VPN Connectivity Troubleshooting",
                        Category: "Network",
                        Summary: "Steps to resolve common Cisco AnyConnect VPN issues including certificate errors and routing problems.",
                        Content: "1. Verify network connection\n2. Check certificate\n3. Restart VPN service.",
                        LastUpdated: "2023-10-12",
                        Author: "Network Engineering"
                    },
                    {
                        ArticleID: "KB-1002",
                        Title: "SAP Authorization Troubleshooting",
                        Category: "SAP",
                        Summary: "How to use SU53 to identify missing authorization objects and request access.",
                        Content: "Run SU53 immediately after authorization failure.",
                        LastUpdated: "2023-11-05",
                        Author: "SAP Security"
                    }
                ],
                StatusHistory: [],
                KPIs: {
                    OpenTickets: 0,
                    CriticalTickets: 0,
                    SlaAtRisk: 0,
                    SlaBreached: 0,
                    ResolvedToday: 0
                },
                CurrentUser: {
                    name: "System Admin",
                    userId: "ADMIN001",
                    role: "Support Administrator"
                },
                Analytics: {
                    Status: [],
                    Priority: [],
                    Category: [],
                    SLA: []
                },
                MyKPIs: {
                    OpenTickets: 0,
                    CriticalTickets: 0,
                    SlaAtRisk: 0,
                    ResolvedToday: 0
                }
            };

            this._oModel = new JSONModel(oData);
            this._oModel.setDefaultBindingMode("TwoWay");
            this._oComponent.setModel(this._oModel, "data");
            
            this.updateKPIs();
            // Start a timer to recalculate SLAs periodically
            setInterval(this.recalculateSLAs.bind(this), 60000); // Every minute
        },

        getTicket: function (sTicketId) {
            var aTickets = this._oModel.getProperty("/Tickets");
            return aTickets.find(function(t) { return t.TicketID === sTicketId; });
        },

        getCommentsForTicket: function(sTicketId) {
            var aComments = this._oModel.getProperty("/Comments");
            return aComments.filter(function(c) { return c.TicketID === sTicketId; });
        },

        createTicket: function (oTicketData) {
            var aTickets = this._oModel.getProperty("/Tickets");
            var iNewId = 10024 + aTickets.length; // mock sequence
            
            var oNewTicket = {
                TicketID: "INC-" + iNewId,
                Title: oTicketData.Title,
                Description: oTicketData.Description,
                Category: oTicketData.Category,
                SubCategory: oTicketData.SubCategory || "",
                Priority: oTicketData.Priority || "Medium",
                Status: "NEW",
                Requester: oTicketData.Requester,
                RequesterEmail: oTicketData.RequesterEmail || "",
                RequesterDepartment: oTicketData.RequesterDepartment || "",
                AssignedTo: oTicketData.AssignedTo || "",
                AssignedToUserID: "", // Could be mapped if a proper user list existed
                SupportTeam: oTicketData.SupportTeam || "",
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString(),
                Resolution: "",
                ResolutionNotes: "",
                EscalationLevel: "Level 1"
            };

            var sAuthor = this._oModel.getProperty("/CurrentUser/name");

            if (oNewTicket.AssignedTo) {
                oNewTicket.Status = "ASSIGNED";
                this.addHistory(oNewTicket.TicketID, "NEW", "ASSIGNED", sAuthor, "Initial Assignment");
            } else {
                this.addHistory(oNewTicket.TicketID, "", "NEW", sAuthor, "Ticket Created");
            }

            switch(oNewTicket.Priority) {
                case "Critical": oNewTicket.SLATargetHours = 4; break;
                case "High": oNewTicket.SLATargetHours = 8; break;
                case "Medium": oNewTicket.SLATargetHours = 24; break;
                case "Low": oNewTicket.SLATargetHours = 48; break;
                default: oNewTicket.SLATargetHours = 24;
            }

            oNewTicket.DueDate = new Date(new Date().getTime() + (oNewTicket.SLATargetHours * 60 * 60 * 1000)).toISOString();
            oNewTicket.SLAStatus = "WITHIN_SLA";

            aTickets.unshift(oNewTicket);
            this._oModel.setProperty("/Tickets", aTickets);
            this.updateKPIs();
            return oNewTicket.TicketID;
        },

        getHistoryForTicket: function(sTicketId) {
            var aHistory = this._oModel.getProperty("/StatusHistory");
            return aHistory.filter(function(h) { return h.TicketID === sTicketId; });
        },

        addHistory: function(sTicketId, sOldStatus, sNewStatus, sChangedBy, sReason) {
            var aHistory = this._oModel.getProperty("/StatusHistory");
            aHistory.push({
                TicketID: sTicketId,
                OldStatus: sOldStatus,
                NewStatus: sNewStatus,
                ChangedBy: sChangedBy,
                ChangedAt: new Date().toISOString(),
                Reason: sReason || ""
            });
            this._oModel.setProperty("/StatusHistory", aHistory);
        },

        updateTicketStatus: function(sTicketId, sNewStatus, sAssignedTo, sAssignedToId, sReason, sResolvedBy, sResolution, sResolutionNotes) {
            var aTickets = this._oModel.getProperty("/Tickets");
            var oTicket = aTickets.find(function(t) { return t.TicketID === sTicketId; });
            if (oTicket) {
                var sOldStatus = oTicket.Status;
                oTicket.Status = sNewStatus;
                if (sAssignedTo !== undefined) {
                    oTicket.AssignedTo = sAssignedTo;
                    oTicket.AssignedToUserID = sAssignedToId || "";
                }
                if (sNewStatus === "RESOLVED") {
                    oTicket.SLAStatus = "MET";
                    oTicket.ResolvedAt = new Date().toISOString();
                    oTicket.ResolvedBy = sResolvedBy;
                    oTicket.Resolution = sResolution;
                    oTicket.ResolutionNotes = sResolutionNotes || "";
                } else if (sNewStatus === "REOPENED") {
                    oTicket.SLAStatus = "AT_RISK"; 
                }
                oTicket.UpdatedAt = new Date().toISOString();
                this._oModel.setProperty("/Tickets", aTickets);
                
                var sAuthor = this._oModel.getProperty("/CurrentUser/name");
                this.addHistory(sTicketId, sOldStatus, sNewStatus, sAuthor, sReason);
                
                this.updateKPIs();
                return true;
            }
            return false;
        },

        escalateTicket: function(sTicketId) {
            var aTickets = this._oModel.getProperty("/Tickets");
            var oTicket = aTickets.find(function(t) { return t.TicketID === sTicketId; });
            if (oTicket) {
                if (oTicket.EscalationLevel === "Level 1") oTicket.EscalationLevel = "Level 2";
                else if (oTicket.EscalationLevel === "Level 2") oTicket.EscalationLevel = "Level 3";
                oTicket.UpdatedAt = new Date().toISOString();
                this._oModel.setProperty("/Tickets", aTickets);
                return true;
            }
            return false;
        },

        addComment: function(sTicketId, sText) {
            var aComments = this._oModel.getProperty("/Comments");
            var sCommentId = "COM-" + (Math.floor(Math.random() * 10000));
            aComments.push({
                CommentID: sCommentId,
                TicketID: sTicketId,
                Author: this._oModel.getProperty("/CurrentUser/name"),
                AuthorUserID: this._oModel.getProperty("/CurrentUser/userId"),
                CommentText: sText,
                CreatedAt: new Date().toISOString(),
                CommentType: "Tech"
            });
            this._oModel.setProperty("/Comments", aComments);
        },

        updateKPIs: function() {
            var aTickets = this._oModel.getProperty("/Tickets");
            var oKPIs = { OpenTickets: 0, CriticalTickets: 0, SlaAtRisk: 0, SlaBreached: 0, ResolvedToday: 0 };
            var oMyKPIs = { OpenTickets: 0, CriticalTickets: 0, SlaAtRisk: 0, ResolvedToday: 0 };
            
            var sCurrentUser = this._oModel.getProperty("/CurrentUser/userId");
            var today = new Date();
            today.setHours(0,0,0,0);

            aTickets.forEach(function(t) {
                var bIsMine = (t.AssignedToUserID === sCurrentUser);
                var bIsOpen = (t.Status !== "CLOSED" && t.Status !== "RESOLVED");
                var bIsResolvedToday = false;
                
                if (t.Status === "RESOLVED" && t.ResolvedAt) {
                    var resolvedDate = new Date(t.ResolvedAt);
                    if (resolvedDate >= today) {
                        bIsResolvedToday = true;
                    }
                }

                if (bIsOpen) {
                    oKPIs.OpenTickets++;
                    if (bIsMine) oMyKPIs.OpenTickets++;
                }
                
                if (t.Priority === "Critical" && bIsOpen) {
                    oKPIs.CriticalTickets++;
                    if (bIsMine) oMyKPIs.CriticalTickets++;
                }
                
                if (t.SLAStatus === "AT_RISK" && bIsOpen) {
                    oKPIs.SlaAtRisk++;
                    if (bIsMine) oMyKPIs.SlaAtRisk++;
                }
                
                if (t.SLAStatus === "BREACHED" && bIsOpen) {
                    oKPIs.SlaBreached++;
                }
                
                if (bIsResolvedToday) {
                    oKPIs.ResolvedToday++;
                    if (bIsMine) oMyKPIs.ResolvedToday++;
                }
            });

            this._oModel.setProperty("/KPIs", oKPIs);
            this._oModel.setProperty("/MyKPIs", oMyKPIs);
            this._updateAnalytics();
        },

        _updateAnalytics: function() {
            var aTickets = this._oModel.getProperty("/Tickets");
            var oStatusCount = { "NEW":0, "ASSIGNED":0, "IN_PROGRESS":0, "RESOLVED":0, "CLOSED":0, "REOPENED":0 };
            var oPriorityCount = { "Critical":0, "High":0, "Medium":0, "Low":0 };
            var oCategoryCount = { "Network":0, "SAP":0, "Hardware":0, "Software":0, "Security":0, "Email":0, "Printer":0, "SAP Security":0, "Access Management":0 };
            var oSLACount = { "WITHIN_SLA":0, "AT_RISK":0, "BREACHED":0, "MET":0 };

            aTickets.forEach(function(t) {
                if (oStatusCount[t.Status] !== undefined) oStatusCount[t.Status]++;
                if (oPriorityCount[t.Priority] !== undefined) oPriorityCount[t.Priority]++;
                
                var cat = t.Category || "Other";
                if (oCategoryCount[cat] === undefined) { oCategoryCount[cat] = 0; }
                oCategoryCount[cat]++;
                
                if (oSLACount[t.SLAStatus] !== undefined) oSLACount[t.SLAStatus]++;
            });

            var mapToArray = function(obj, colors) {
                return Object.keys(obj).map(function(k) {
                    return { label: k, value: obj[k], color: colors ? colors[k] : "Neutral" };
                });
            };

            var oAnalytics = {
                Status: mapToArray(oStatusCount, { "NEW":"Information", "ASSIGNED":"Good", "IN_PROGRESS":"Critical", "RESOLVED":"Good", "CLOSED":"Neutral", "REOPENED":"Error" }),
                Priority: mapToArray(oPriorityCount, { "Critical":"Error", "High":"Critical", "Medium":"Neutral", "Low":"Good" }),
                Category: mapToArray(oCategoryCount).filter(function(i){ return i.value > 0; }), // remove 0 counts
                SLA: mapToArray(oSLACount, { "WITHIN_SLA":"Good", "AT_RISK":"Critical", "BREACHED":"Error", "MET":"Good" })
            };

            this._oModel.setProperty("/Analytics", oAnalytics);
        },

        recalculateSLAs: function() {
            var aTickets = this._oModel.getProperty("/Tickets");
            var now = new Date().getTime();
            var bChanged = false;

            aTickets.forEach(function(t) {
                if (t.Status === "RESOLVED" || t.Status === "CLOSED") return;
                
                var dueDate = new Date(t.DueDate).getTime();
                var remainingHours = (dueDate - now) / (1000 * 60 * 60);
                
                var sNewSlaStatus = "WITHIN_SLA";
                if (remainingHours < 0) {
                    sNewSlaStatus = "BREACHED";
                } else if (remainingHours < (t.SLATargetHours * 0.2)) { // 20% remaining
                    sNewSlaStatus = "AT_RISK";
                }

                if (t.SLAStatus !== sNewSlaStatus) {
                    t.SLAStatus = sNewSlaStatus;
                    bChanged = true;
                }
            });

            if (bChanged) {
                this._oModel.setProperty("/Tickets", aTickets);
                this.updateKPIs();
            }
        },

        simulateAIAnalysis: function(sDescription) {
            return new Promise(function(resolve) {
                setTimeout(function() {
                    var lowerDesc = sDescription.toLowerCase();
                    var category = "Software";
                    var priority = "Medium";
                    var team = "Service Desk";
                    var summary = "User is reporting a general IT issue that requires standard troubleshooting.";
                    
                    if (lowerDesc.indexOf("vpn") !== -1 || lowerDesc.indexOf("network") !== -1) {
                        category = "Network";
                        priority = "High";
                        team = "Network Operations";
                        summary = "User is unable to establish network connectivity, likely related to VPN.";
                    } else if (lowerDesc.indexOf("sap") !== -1 || lowerDesc.indexOf("authorization") !== -1) {
                        category = "SAP Security";
                        priority = "High";
                        team = "SAP Security";
                        summary = "User is experiencing SAP authorization or access issues.";
                    } else if (lowerDesc.indexOf("laptop") !== -1 || lowerDesc.indexOf("slow") !== -1 || lowerDesc.indexOf("freeze") !== -1) {
                        category = "Hardware";
                        priority = "Medium";
                        team = "End User Computing";
                        summary = "User is reporting performance degradation on their end-user device.";
                    }

                    resolve({
                        AIClassification: category,
                        AIRecommendedPriority: priority,
                        AIRecommendedTeam: team,
                        AISummary: summary,
                        AIResolution: "1. Follow standard runbook for " + category + ".\n2. Verify user identity.\n3. Check relevant logs.\n4. Escalate to " + team + " if issue persists."
                    });
                }, 1500); // simulate delay
            });
        }
    });
});
