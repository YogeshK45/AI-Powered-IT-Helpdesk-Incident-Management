sap.ui.define([
    "sap/ui/base/ManagedObject"
], function (ManagedObject) {
    "use strict";

    return ManagedObject.extend("it.helpdesk.incident.service.KnowledgeService", {
        constructor: function (oMockDataService) {
            this._oDataService = oMockDataService;
            this._ensureArticles();
        },

        _ensureArticles: function() {
            var aArticles = this._oDataService._oModel.getProperty("/KnowledgeBase");
            if (!aArticles || aArticles.length < 10) {
                aArticles = [
                    {
                        ArticleID: "KB-1001", Title: "VPN Connectivity Troubleshooting", Category: "Network",
                        Summary: "Steps to resolve common VPN connectivity issues.",
                        Content: "1. Verify network connection.\n2. Check credentials.\n3. Restart VPN service.",
                        Author: "Network Engineering", LastUpdated: "2023-10-12", Tags: ["VPN", "Network", "Connection"]
                    },
                    {
                        ArticleID: "KB-1002", Title: "SAP Authorization Troubleshooting", Category: "SAP Security",
                        Summary: "How to use SU53 to identify missing authorizations.",
                        Content: "1. Run SU53.\n2. Note the missing authorization object.\n3. Request role update via IAM.",
                        Author: "SAP Security", LastUpdated: "2023-11-05", Tags: ["SAP", "Authorization", "SU53"]
                    },
                    {
                        ArticleID: "KB-1003", Title: "SAP Login Troubleshooting", Category: "SAP",
                        Summary: "Resolving SAP GUI login and connection errors.",
                        Content: "1. Verify saplogon.ini file.\n2. Check if the backend is reachable via ping.\n3. Verify credentials.",
                        Author: "SAP Support", LastUpdated: "2023-09-22", Tags: ["SAP", "Login", "GUI"]
                    },
                    {
                        ArticleID: "KB-1004", Title: "Corporate DNS Troubleshooting", Category: "Network",
                        Summary: "Diagnosing internal DNS resolution failures.",
                        Content: "1. Run ipconfig /flushdns.\n2. Perform nslookup for internal domains.\n3. Check proxy settings.",
                        Author: "Network Operations", LastUpdated: "2023-08-14", Tags: ["DNS", "Network", "Proxy"]
                    },
                    {
                        ArticleID: "KB-1005", Title: "Network Connectivity Troubleshooting", Category: "Network",
                        Summary: "Basic connectivity checks for LAN and Wi-Fi.",
                        Content: "1. Check physical cable.\n2. Verify Wi-Fi network is 'Corp-Secure'.\n3. Restart network adapter.",
                        Author: "End User Computing", LastUpdated: "2023-12-01", Tags: ["LAN", "Wi-Fi", "Connectivity"]
                    },
                    {
                        ArticleID: "KB-1006", Title: "Password Reset Procedure", Category: "Access Management",
                        Summary: "Standard operating procedure for resetting AD passwords.",
                        Content: "1. Verify user identity via security questions.\n2. Reset AD password.\n3. Remind user to update mobile devices.",
                        Author: "Service Desk", LastUpdated: "2024-01-15", Tags: ["Password", "AD", "Access"]
                    },
                    {
                        ArticleID: "KB-1007", Title: "Printer Connectivity Guide", Category: "Printer",
                        Summary: "Resolving 'Printer Offline' or spooler errors.",
                        Content: "1. Ping printer IP.\n2. Clear print spooler service.\n3. Re-add printer via network path.",
                        Author: "Facilities IT", LastUpdated: "2023-07-30", Tags: ["Printer", "Spooler", "Offline"]
                    },
                    {
                        ArticleID: "KB-1008", Title: "Laptop Performance Troubleshooting", Category: "Hardware",
                        Summary: "Addressing slow performance, freezing, or high CPU usage.",
                        Content: "1. Check Task Manager for high resource usage.\n2. Run hardware diagnostics (F12 on boot).\n3. Check for mandatory Windows Updates.",
                        Author: "End User Computing", LastUpdated: "2023-11-20", Tags: ["Laptop", "Performance", "Hardware"]
                    },
                    {
                        ArticleID: "KB-1009", Title: "Email Access Troubleshooting", Category: "Email",
                        Summary: "Resolving Outlook sync or access issues.",
                        Content: "1. Check OWA (Webmail) access.\n2. Recreate Outlook profile.\n3. Verify mobile ActiveSync status.",
                        Author: "Enterprise Messaging", LastUpdated: "2023-10-05", Tags: ["Email", "Outlook", "Sync"]
                    },
                    {
                        ArticleID: "KB-1010", Title: "SAP User Access Procedure", Category: "SAP Security",
                        Summary: "Requesting and provisioning new SAP user access.",
                        Content: "1. User submits GRC request.\n2. Manager approves.\n3. Role owner approves.\n4. Access provisioned automatically.",
                        Author: "SAP Security", LastUpdated: "2023-12-10", Tags: ["SAP", "Access", "GRC"]
                    }
                ];
                this._oDataService._oModel.setProperty("/KnowledgeBase", aArticles);
            }
        },

        getArticles: function() {
            return this._oDataService._oModel.getProperty("/KnowledgeBase");
        },

        searchArticles: function(sQuery, sCategory) {
            var aArticles = this.getArticles();
            var lowerQuery = sQuery ? sQuery.toLowerCase() : "";
            
            return aArticles.filter(function(art) {
                var matchCategory = !sCategory || sCategory === "All" || art.Category === sCategory;
                var matchQuery = !lowerQuery || 
                    art.Title.toLowerCase().indexOf(lowerQuery) !== -1 ||
                    art.Summary.toLowerCase().indexOf(lowerQuery) !== -1 ||
                    art.Content.toLowerCase().indexOf(lowerQuery) !== -1 ||
                    art.Tags.some(function(t) { return t.toLowerCase().indexOf(lowerQuery) !== -1; });
                return matchCategory && matchQuery;
            });
        },

        getArticleById: function(sId) {
            return this.getArticles().find(function(a) { return a.ArticleID === sId; });
        },

        findRelevantArticles: function(sDescription, sCategory) {
            var aArticles = this.getArticles();
            var lowerDesc = (sDescription || "").toLowerCase();
            
            var aRelevant = aArticles.map(function(art) {
                var score = 0;
                if (sCategory && art.Category === sCategory) score += 50;
                
                art.Tags.forEach(function(tag) {
                    if (lowerDesc.indexOf(tag.toLowerCase()) !== -1) score += 20;
                });
                
                return {
                    article: art,
                    relevance: Math.min(score, 99)
                };
            }).filter(function(item) {
                return item.relevance > 0;
            }).sort(function(a, b) {
                return b.relevance - a.relevance;
            });

            return aRelevant.slice(0, 3).map(function(item) {
                return {
                    ArticleID: item.article.ArticleID,
                    Title: item.article.Title,
                    Category: item.article.Category,
                    Relevance: item.relevance
                };
            });
        }
    });
});
