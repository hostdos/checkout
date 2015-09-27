var vm = new Vue({
    el: '#app',

    ready: function() { 
        this.getArticles();
        this.getGroups();
    },

    data: {
        baseUrl: 'http://46.101.209.111',

        articles: [], 
        groups: [],
        orderArticles: [],
        activeGroup: null,
        amountGiven: '',
        orderId: 0,

        displayStatusbar: false,
        statusbarText: '',
        statusbarError: false, 
 
        filters: {
            active: function(article)
            {
                if(article.groupId === vm.$data.activeGroup.id) {
                    return article;
                }
            },
        },
    },

    computed: {
        amountToReturn: function()
        {
            var amount = +this.amountGiven - this.totalPrice;
            if(amount < 0)
            {
                return 0;
            }
            return amount;
        },
        activeGroupArticles: function()
        {
            if(this.activeGroup !== null)
            {
                return this.articles.filter(this.filters.active);
            }

            return this.articles;
        },
        totalPrice: function () 
        {
            var total = 0;
            this.orderArticles.forEach(function(el) {
                total += +el.article.price;
            });

            return total;
        }
    },

    methods: { 
        getArticles: function()
        {
            this.$http.get(this.baseUrl + '/articles', 
                function (data, status, request) {
                    this.$set('articles', data);
                }, {
                    error: function(data, status, request) {
                        this.showStatusbar('Error: No connection to server - ' + status, true);
                    }
                });
        },

        getGroups: function()
        {
            this.$http.get(this.baseUrl + '/groups', function (data, status, request) {
                    this.$set('groups', data);
                }, {
                    error: function(data, status, request) {
                        this.showStatusbar('Error: No connection to server - ' + status, true);
                    }
                });
        },

        makeOrder: function()
        {
            var articleList = [];
            this.orderArticles.forEach(function(el) {
                articleList.push(+el.article.id);
            });
            articleList = {article: articleList};
            var xhr = new XMLHttpRequest();
 
            var self = this;
            xhr.open('POST', this.baseUrl + '/orders');
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onload = function () {
                self.orderId = +xhr.responseText; 
                self.showStatusbar('Order Nr. ' + self.orderId + ' successful');
                setTimeout(self.finishOrder, 100); 
            };
            xhr.onerror = function () {
                self.showStatusbar('Error: No connection to server - ' + status, true);
            };
            xhr.send(JSON.stringify(articleList));


        }, 

        finishOrder: function()
        {
            var needsPrinting = false;
            this.orderArticles.forEach(function(el) {
                if(el.article.beleg === 1)
                    needsPrinting = true;
            });

            if(needsPrinting)
                window.print();
            this.clearOrder(); 
            this.clearGiven();   
        },

        clearOrder: function()
        {
            this.orderArticles = [];
            this.clearGiven();
        },

        addArticleToOrder: function(article)
        {

            this.orderArticles.push({
                article: article
            });
        },

        setActiveGroup: function(group)
        {
            this.activeGroup = group;
        },

        addToGiven: function(amount)
        {
            this.amountGiven += amount;
        },

        clearGiven: function()
        {
            this.amountGiven = '';
        },

        removeOrderArticle: function(article)
        {
            this.orderArticles.$remove(article);
        },

        showStatusbar: function(text, error)
        {
            if(error)
            {
                this.statusbarError = true;
            }
            this.statusbarText = text;
            this.displayStatusbar = true;
            if(!error) {
                setTimeout(this.hideStatusbar, 2000);
            }
        },

        hideStatusbar: function()
        {
            this.displayStatusbar = false;
            this.statusbarError = false;
        }
    } 
});