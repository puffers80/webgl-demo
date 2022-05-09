var points = [];	// 存放顶点坐标的数组，初始为空
var vertices = [];
var treeNumDivide=5;
window.onload = function main(){
    var canvas = document.getElementById("webgl");
	if(!canvas){ // 获取失败？
		alert("获取canvas元素失败！"); 
		return;
	}
    var gl = WebGLUtils.setupWebGL(canvas);    
    if (!gl){ // 失败则弹出信息
		alert("获取WebGL上下文失败！"); 
		return;
	}
    var Lines = [	
		vec2(0,0.7),vec2(0,0),
		vec2(0.6,0.35),vec2(0,0),
		vec2(0.6,-0.35),vec2(0,0),
		vec2(0,-0.7),vec2(0,0),
		vec2(-0.6,-0.35),vec2(0,0),
		vec2(-0.6,0.35),vec2(0,0)
		/*		vec2(0,0.98),vec2(0,0),
		vec2(0.84,0.49),vec2(0,0),
		vec2(0.84,-0.49),vec2(0,0),
		vec2(0,-0.98),vec2(0,0),
		vec2(-0.84,-0.49),vec2(0,0),
		vec2(-0.84,0.49),vec2(0,0)*/
    ];	
	divideTree(Lines[0],Lines[1],treeNumDivide,0.5,90);
	divideTree(Lines[2],Lines[3],treeNumDivide,0.5,30);
	divideTree(Lines[4],Lines[5],treeNumDivide,0.5,330);
	divideTree(Lines[6],Lines[7],treeNumDivide,0.5,270);
	divideTree(Lines[8],Lines[9],treeNumDivide,0.5,210);
	divideTree(Lines[10],Lines[11],treeNumDivide,0.5,150);
		console.log("当前DT");
	Tree(Lines[0],Lines[1],treeNumDivide,0.4,90);
	Tree(Lines[2],Lines[3],treeNumDivide,0.4,30);
	Tree(Lines[4],Lines[5],treeNumDivide,0.4,330);
	Tree(Lines[6],Lines[7],treeNumDivide,0.4,270);
	Tree(Lines[8],Lines[9],treeNumDivide,0.4,210);
	Tree(Lines[10],Lines[11],treeNumDivide,0.4,150);
		console.log("当前TT");	
	divide(Lines[0],Lines[1],treeNumDivide,0.5,90);
	divide(Lines[2],Lines[3],treeNumDivide,0.5,30);
	divide(Lines[4],Lines[5],treeNumDivide,0.5,330);
	divide(Lines[6],Lines[7],treeNumDivide,0.5,270);
	divide(Lines[8],Lines[9],treeNumDivide,0.5,210);
	divide(Lines[10],Lines[11],treeNumDivide,0.5,150);
		console.log("当前DD");	
	
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);//设置背景色为075*3+1.0
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);//启用该shader程序对象	
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0){
		alert("获取attribute变量a_Position失败！");
		return;
	}
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Position);//启用顶点属性数组

    render(gl);
};

//----------------------------------------------------------------------------
// 绘制函数，参数为WebGL上下文
function render(gl) {
	gl.clear(gl.COLOR_BUFFER_BIT); // 用背景色擦除窗口内容
	for(var i = 0; i < points.length; i+=2)
	{
		gl.drawArrays(gl.LINES,i,2);
	}
}
// 递归细分
function divideTree(a,b,k,r,j){//放入终点起点
	if(k > 0){			
		var c = mult(0.5, add(a, b));
		tree(a, b, c);//放入起点终点中点
		var a_x = c[0];
		var a_y = c[1];
		var b_x = c[0];
		var b_y = c[1];
		var j1 = j-30;
		var j2 = j+30;
		a_x = a_x + r*(Math.cos(j1*Math.PI/180));
		a_y = a_y + r*(Math.sin(j1*Math.PI/180));
		b_x = b_x + r*(Math.cos(j2*Math.PI/180));
		b_y = b_y + r*(Math.sin(j2*Math.PI/180));	
		var an = vec2(a_x,a_y);
		var bn = vec2(b_x,b_y);
		r=r/2;
		divideTree(an,c,k-1,r,j1);
		divideTree(bn,c,k-1,r,j2);		
	}
}
function Tree(a,b,k,r,j){//放入终点起点
	if(k > 0){			
		var c = mult(0.3, add(a, b));
		tree(a, b, c);//放入起点终点中点
		var a_x = c[0];
		var a_y = c[1];
		var b_x = c[0];
		var b_y = c[1];
		var j1 = j-45;
		var j2 = j+45;
		a_x = a_x + r*(Math.cos(j1*Math.PI/180));
		a_y = a_y + r*(Math.sin(j1*Math.PI/180));
		b_x = b_x + r*(Math.cos(j2*Math.PI/180));
		b_y = b_y + r*(Math.sin(j2*Math.PI/180));	
		var an = vec2(a_x,a_y);
		var bn = vec2(b_x,b_y);
		r=r/2;
		divideTree(an,c,k-1,r,j1);
		divideTree(bn,c,k-1,r,j2);		
	}
}
function divide(a,b,k,r,j){//放入终点起点
	if(k > 0){
		var c = mult(0.3, add(a, b));		
		divi(b, c);
		var a_x = c[0];
		var a_y = c[1];
		var b_x = c[0];
		var b_y = c[1];
		var j1 = j-30;
		var j2 = j+30;
		a_x = a_x + r*(Math.cos(j1*Math.PI/180));
		a_y = a_y + r*(Math.sin(j1*Math.PI/180));
		b_x = b_x + r*(Math.cos(j2*Math.PI/180));
		b_y = b_y + r*(Math.sin(j2*Math.PI/180));	
		var an = vec2(a_x,a_y);
		var bn = vec2(b_x,b_y);
		r=r/4;
		//tree(an, bn, c);		
		divide(an,c,k-1,r,j1);
		divide(bn,c,k-1,r,j2);
	}
}

function tree(a,b,c){//起点中点
	points.push(c);
	points.push(a);
	points.push(c);
	points.push(b);
}
function divi(a,b){//起点中点
	points.push(a);
	points.push(b);
}