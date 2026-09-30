sap.ui.define([
    "sap/ui/base/ManagedObject"
], function (ManagedObject) {
    "use strict";

    return ManagedObject.extend("it.helpdesk.incident.service.aiService", {
        constructor: function (oMockDataService, oKnowledgeService) {
            this._oDataService = oMockDataService;
            this._oKnowledgeService = oKnowledgeService;
        },

        analyzeIncident: function(sDescription, sCurrentTicketId) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    try {
                        var oClassification = this.classifyIncident(sDescription);
                        var sSummary = this.generateSummary(sDescription, oClassification);
                        var oSimilar = this.findSimilarIncidents(sDescription, oClassification, sCurrentTicketId);
                        var aKnowledge = this._oKnowledgeService.findRelevantArticles(sDescription, oClassification.Category);

                        resolve({
                            AIClassification: oClassification.Category,
                            AIIssueType: oClassification.IssueType,
                            AIRecommendedPriority: oClassification.Priority,
                            AIRecommendedTeam: oClassification.Team,
                            AIConfidence: oClassification.Confidence,
                            AISummary: sSummary,
                            AIResolution: oClassification.Resolution,
                            SimilarIncidents: oSimilar,
                            KnowledgeSources: aKnowledge
                        });
                    } catch (e) {
                        reject(e);
                    }
                }.bind(this), 1500); // 1.5s simulated network delay
            }.bind(this));
        },

        classifyIncident: function(sDescription) {
            var lowerDesc = (sDescription || "").toLowerCase();
            
            var rules = [
                {
                    match: ["vpn", "anyconnect", "tunnel"],
                    Category: "VPN", IssueType: "VPN Connectivity", Priority: "High", Team: "Network Operations",
                    Resolution: "1. Verify VPN authentication.\n2. Confirm user network connectivity.\n3. Check internal DNS resolution.\n4. Validate VPN routing.\n5. Restart VPN client.",
                    Confidence: 94
                },
                {
                    match: ["sap", "authorization", "su53", "access", "role"],
                    Category: "SAP Security", IssueType: "SAP Authorization", Priority: "High", Team: "SAP Security",
                    Resolution: "1. Verify assigned roles.\n2. Check authorization object using SU53.\n3. Check recent role changes.\n4. Validate user authorization.",
                    Confidence: 92
                },
                {
                    match: ["sap", "login", "password", "gui"],
                    Category: "SAP", IssueType: "SAP Login", Priority: "High", Team: "SAP Support",
                    Resolution: "1. Verify SAP credentials.\n2. Check system availability.\n3. Verify client/system selection.\n4. Check user lock status.",
                    Confidence: 89
                },
                {
                    match: ["printer", "print", "spooler", "toner", "paper"],
                    Category: "Printer", IssueType: "Printer Error", Priority: "Low", Team: "End User Computing",
                    Resolution: "1. Check printer connectivity.\n2. Verify printer status.\n3. Clear print queue.\n4. Check printer driver.",
                    Confidence: 96
                },
                {
                    match: ["laptop", "desktop", "slow", "freeze", "crash", "blue screen"],
                    Category: "Hardware", IssueType: "Hardware Performance", Priority: "Medium", Team: "End User Computing",
                    Resolution: "1. Check device status.\n2. Restart device.\n3. Check hardware diagnostics.\n4. Verify peripheral connections.",
                    Confidence: 85
                },
                {
                    match: ["email", "outlook", "mailbox", "exchange"],
                    Category: "Email", IssueType: "Email Sync", Priority: "Medium", Team: "Enterprise Messaging",
                    Resolution: "1. Check mailbox availability.\n2. Verify credentials.\n3. Check mail client configuration.\n4. Check mail server connectivity.",
                    Confidence: 88
                },
                {
                    match: ["phishing", "malware", "virus", "suspicious", "breach"],
                    Category: "Security", IssueType: "Security Alert", Priority: "Critical", Team: "IT Security",
                    Resolution: "1. Verify access logs.\n2. Check security policy.\n3. Review authentication logs.\n4. Escalate to IT Security immediately.",
                    Confidence: 98
                },
                {
                    match: ["network", "internet", "dns", "lan", "wifi"],
                    Category: "Network", IssueType: "Network Connectivity", Priority: "High", Team: "Network Operations",
                    Resolution: "1. Check connectivity.\n2. Verify DNS resolution.\n3. Check routing tables.\n4. Verify network interface status.",
                    Confidence: 87
                }
            ];

            for (var i = 0; i < rules.length; i++) {
                if (rules[i].match.some(function(keyword) { return lowerDesc.indexOf(keyword) !== -1; })) {
                    return rules[i];
                }
            }

            // Default fallback
            return {
                Category: "Software", IssueType: "Application Issue", Priority: "Medium", Team: "Service Desk",
                Resolution: "1. Collect application logs.\n2. Verify user steps.\n3. Attempt to reproduce.\n4. Escalate to Level 2 support if needed.",
                Confidence: 75
            };
        },

        generateSummary: function(sDescription, oClassification) {
            return "Based on the description, the user is experiencing an issue related to " + oClassification.Category + 
                   ". The issue appears to be a " + oClassification.IssueType + " problem requiring " + oClassification.Team + " attention.";
        },

        findSimilarIncidents: function(sDescription, oClassification, sCurrentTicketId) {
            var aAllTickets = this._oDataService._oModel.getProperty("/Tickets");
            var lowerDesc = (sDescription || "").toLowerCase();

            var aSimilar = aAllTickets.map(function(t) {
                if (t.TicketID === sCurrentTicketId) return { ticket: t, similarity: 0 };
                
                var sim = 0;
                if (t.Category === oClassification.Category) sim += 40;
                
                // Simple word overlap
                var words = lowerDesc.split(" ");
                var targetDesc = (t.Title + " " + t.Description).toLowerCase();
                var matches = 0;
                words.forEach(function(w) {
                    if (w.length > 4 && targetDesc.indexOf(w) !== -1) matches++;
                });
                
                sim += Math.min(matches * 10, 50);
                
                return { ticket: t, similarity: sim };
            }).filter(function(item) {
                return item.similarity > 40;
            }).sort(function(a, b) {
                return b.similarity - a.similarity;
            });

            return aSimilar.slice(0, 3).map(function(item) {
                return {
                    TicketID: item.ticket.TicketID,
                    Title: item.ticket.Title,
                    Category: item.ticket.Category,
                    Resolution: item.ticket.Resolution || "Pending resolution",
                    Similarity: item.similarity
                };
            });
        },
        
        logAnalysis: function(sTicketId, oClassification) {
            var aAnalyses = this._oDataService._oModel.getProperty("/AIAnalyses") || [];
            aAnalyses.unshift({
                TicketID: sTicketId || "Unknown",
                AnalysisDate: new Date().toISOString(),
                Category: oClassification.AIClassification || oClassification.Category,
                Priority: oClassification.AIRecommendedPriority || oClassification.Priority,
                Confidence: oClassification.AIConfidence || oClassification.Confidence
            });
            // Keep top 20
            if (aAnalyses.length > 20) aAnalyses.pop();
            this._oDataService._oModel.setProperty("/AIAnalyses", aAnalyses);
        },
        
        getRecentAnalyses: function() {
            return this._oDataService._oModel.getProperty("/AIAnalyses") || [];
        }
    });
});
