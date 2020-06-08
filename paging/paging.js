/**
 * 分页函数
 * pno--页数
 * psize--每页显示记录数
 * 分页部分是从真实数据行开始，因而存在加减某个常数，以确定真正的记录数
 * 纯js分页实质是数据行全部加载，通过是否显示属性完成分页功能
 **/
function goPage(pno,psize){
    // var total,  //总数据
    //     prev,  //上一页
    //     next,  //下一页
    //     currentPage,  //显示页数
    //     totalPage,   //总页数
    //     pageSize;  //每页显示多少条数据


    var itable = document.getElementById("idData");
    var total = itable.rows.length;//表格所有行数(所有记录数)
    console.log(total);
    var totalPage = 0;//总页数
    var pageSize = psize;//每页显示行数
    //总共分几页 
    if(total/pageSize > parseInt(total/pageSize)){   
            totalPage=parseInt(total/pageSize)+1;   
       }else{   
           totalPage=parseInt(total/pageSize);   
       }   
    var currentPage = pno;//当前页数
    var startRow = (currentPage - 1) * pageSize+1;//开始显示的行  31 
       var endRow = currentPage * pageSize;//结束显示的行   40
       endRow = (endRow > total)? total : endRow;    40
       console.log(endRow);
       //遍历显示数据实现分页
    for(var i=1;i<(total+1);i++){    
        var irow = itable.rows[i-1];
        if(i>=startRow && i<=endRow){
            irow.style.display = "block";    
        }else{
            irow.style.display = "none";
        }
    }
    var pageEnd = document.getElementById("pageEnd");
    var tempStr = "共"+total+"条记录";
    if(currentPage>1){
        tempStr += "<a href=\"#\" onClick=\"goPage("+(currentPage-1)+","+psize+")\">\<</a>"
    }else{
        tempStr += "\<";    
    }
    var currentPageSize = Math.ceil(total / psize);
    // console.log('currentPageSize==',currentPageSize)
    if(currentPageSize < 4){
        for(var i = 1; i <  currentPageSize; i++){
            tempStr += "<div class='currentpage'>"+i+"</div>"
        };
    } else {
        for(var i = 1; i < 3; i++){
            tempStr += "<div class='currentpage'>"+i+"</div>"
        };
        tempStr += "......"
    }
    tempStr += "<div class='currentpage'>"+ currentPageSize +"</div>"
    if(currentPage<totalPage){
        tempStr += "<a href=\"#\" onClick=\"goPage("+(currentPage+1)+","+psize+")\">\></a>";
    }else{
        tempStr += "\>";
    }
    tempStr += "每页显示"
    tempStr += "<a class='current' onclick='currentClick("+"20"+")'>20 </a>"
    tempStr += "<span>|</span>"
    tempStr += "<a class='current' onclick='currentClick("+"50"+")'>50 </a>"
    tempStr += "<span>|</span>"
    tempStr += "<a class='current' onclick='currentClick("+"100"+")'>100 </a>"

    document.getElementById("barcon").innerHTML = tempStr;
    function currentClick(content){
        switch (content) {
            case 20:
                this.pageSize = '20';
                break;
            case 50:
                this.pageSize = '50';
                break;
            case 100:
                this.pageSize = '100';
                break;
            default:
                break;
        }
    }
}


