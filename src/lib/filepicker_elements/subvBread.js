var helpers = require("../reusables/helpers");
var jungle = require("../../vendor/zenjungle");

function beradcrumbView(parent) {
    var self = this;
    var myElements = this.els = {};
    self.model = parent.model;

    myElements.selectAll = jungle([
        ["input[type=checkbox]", {
            title: parent.txt("Select all")
        }]
    ]).childNodes[0];
    myElements.back = jungle([
        ["a.eg-picker-back.eg-btn[title=back]"]
    ]).childNodes[0];
    myElements.crumb = jungle([
        ["span.eg-picker-path"]
    ]).childNodes[0];


    parent.handleClick(myElements.selectAll, function(e) {
        parent.model.setAllSelection(!!e.target.checked);
    });
    parent.handleClick(myElements.back, parent.goUp);
    parent.handleClick(myElements.crumb, function(e) {
        var path = e.target.getAttribute("data-path");
        if (path) {
            self.model.fetch(path);
        }
    });


}
beradcrumbView.prototype.getTree = function() {
    var myElements = this.els;
    var topbar = ["div.eg-bar.eg-top"];
    if (this.model.isMultiselectable) {
        myElements.selectAll.checked = false;
        topbar.push(myElements.selectAll);
    }
    topbar.push(myElements.back);
    topbar.push(myElements.crumb);

    topbar = jungle([topbar]).childNodes[0];

    return topbar;
}


beradcrumbView.prototype.render = function() {
    var currentPath = "/";
    var path = this.model.path || currentPath; //in case path was not provided, go for root

    var list = path.split("/");
    var crumbItems = [];
    var maxSpace = ~~(100 / list.length); //assigns maximum space for text
    helpers.each(list, function(folder, num) {
        if (folder) {
            currentPath += folder + "/";
            num > 1 && (crumbItems.push(["span", "/"]));
            crumbItems.push(["a", {
                    "data-path": currentPath,
                    "title": folder,
                    "style": "max-width:" + maxSpace + "%"
                },
                folder
            ]);

        } else {
            if (num === 0) {
                crumbItems.push(["a", {
                    "data-path": currentPath
                }, "/"]);
            }
        }
    });
    this.els.crumb.innerHTML = "";
    this.els.crumb.appendChild(jungle([crumbItems]));

}

module.exports = beradcrumbView;
