//实验三动画交互
var gl;			//WebGL上下文
var angle = 0.0;//旋转角度
var delta = 60.0;//每秒角度增量
var size = 25;	//正方形边长的一半
var u_Angle;	//shader中uniform变量"u_Angle"的索引
var points = [];
var color = [];
var change = 0;
window.onload = function main(){
	//获取页面中id为webgl的canvas元素
	var canvas = document.getElementById("webgl");
	if(!canvas){
		alert("获取canvas元素失败！");
		return;
	}
	/*利用辅助程序文件中的功能获取WebGL上下文
	成功则后面可通过gl来调用webgl函数*/
	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){//失败弹出信息
		alert("获取WebGL上下文失败！");
		return;
	}
	//顶点位置数据数组(由两个三角形构成一个正方形)
	
	for(var t = 0;t < 1;t+=0.01)
	{
		var r = Math.sin(t*200*3) ;
		var xt = 20 * r * Math.cos(t * 360);
		var yt = 20	* r * Math.sin(t * 360);
		var p = vec2(xt/1.0,yt/1.0);
		points.push(p);
	}
		
	//设置WebGL相关属性
	//设置视口（此处视口占满整个canvas）
	gl.viewport(0,//视口左边界距离canvas左边界距离
				0,//视口下边界距离canvas下边界距离
				canvas.width,//视口宽度
				canvas.height);//视口高度
	gl.clearColor(0.5,0.5,0.5,1.0);//设置背景色为
	/*加载shader程序并未shader中attribute变量提供数据
	加载id分别为"vertex-shader"和"fragment-shader"的shader程序
	并进行编译和链接，返回shader程序对象program*/
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);//启用该shader程序对象
	
	//将顶点属性数据传输到GPU
	var bufferId = gl.createBuffer();
	//将id为bufferId的buffer绑定为当前Arry Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
	//为当前Array Buffer提供数据，传输到GPU
	gl.bufferData(gl.ARRAY_BUFFER,//Buffer类型
		flatten(points),//Buffer数据来源,flatten将vertices转换为GPU可接受的格式
		gl.STATIC_DRAW);//表明将如何使用Buffer(STATIC_DRAW表明是一次提供数据,多遍绘制)
	/*为shader属性变量与buffer数据建立关联
	获取名称为"a_Position"的shader attribute变量的位置*/
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0){
		alert("获取attribute变量a_Position失败！");
		return;
	}
	//指定利用当前Arry Buffer为a_Position提供数据的具体方式
	gl.vertexAttribPointer(a_Position,
		2,//每个顶点属性有两个分量
		gl.FLOAT,//数组数据类型(浮点型)
		false,//不进行归一化处理
		0,//相邻顶点属性地址相差0个字节
		0);//第一个顶点属性在Buffer中偏移量为0字节
	gl.enableVertexAttribArray(a_Position);//启用顶点属性数组
	//获取shader中uniform变量"u_Angle"的索引
	u_Angle = gl.getUniformLocation(program, "u_Angle");
	if(!u_Angle){
		alert("获取uniform变量u_Angle失败！");
		return;
	}
	//获取shader中uniform变量"u_matProj"的索引
	var u_matProj = gl.getUniformLocation(program, "u_matProj");
	if(!u_matProj){
		alert("获取uniform变量u_matProj失败！");
		return;
	}
	//设置视域体,ortho2D四个参数分别为x和y的范围
	var matProj = ortho2D(-size * 1, size * 1, -size * 1, size * 1);
	gl.uniformMatrix4fv(u_matProj, false, flatten(matProj));
	
	//获取shader中uniform变量"u_Color"的索引
	var u_Color = gl.getUniformLocation(program, "u_Color");
	if(!u_Color){
		alert("获取uniform变量u_Color失败！");
		return;
	}
	gl.uniform3f(u_Color, 1.0, 1.0, 1.0);//设置颜色
	
	//加速按钮实现
	var incButton = document.getElementById("IncSpeed");
	if(!incButton){
		alert("获取按钮元素IncSpeed失败！");
		return;
	}
	incButton.onclick = function(){//按钮响应事件
		delta += 60;
	};//incButton.addEventListener("click"),function(){...});
	//减速按钮实现
	var decButton = document.getElementById("DecSpeed");
	if(!decButton){
		alert("获取按钮元素DecSpeed失败！");
		return;
	}
	decButton.onclick = function(){//按钮响应事件
		delta -= 60;
	};
	//放大按钮实现
	var large = document.getElementById("Large");
	if(!large){
		alert("获取按钮元素Large失败！");
		return;
	}
	large.onclick = function(){//按钮响应事件
		size -= 5;
        if(size<=5)
            size = 5; //size=0时会报错
        //更新视域体size
        matProj = ortho2D(-1*size, 1*size, -1*size, 1*size);
	    gl.uniformMatrix4fv(u_matProj, false, flatten(matProj));
	};
	//缩小按钮实现
	var small = document.getElementById("Small");
	if(!small){
		alert("获取按钮元素Small失败！");
		return;
	}
	small.onclick = function(){//按钮响应事件
		size += 3;
		if(size>=70)
			size=70;
        //更新视域体size
        matProj = ortho2D(-1*size, 1*size, -1*size, 1*size);
	    gl.uniformMatrix4fv(u_matProj, false, flatten(matProj));
	};
	//更换绘制方式按钮实现
	var exChange = document.getElementById("ExChange");
	if(!exChange){
		alert("获取按钮元素ExChange失败！");
		return;
	}
	exChange.onclick = function(){//按钮响应事件
		if(change == 0)
			change = 1;
		else
			change = 0;
	};
	
	//处理菜单
	var colorMenu = document.getElementById("ColorMenu");
	if(!colorMenu){
		alert("获取菜单元素colorMenu失败！");
	}
	//添加菜单点击事件响应
	colorMenu.onclick = function(){
		switch(event.target.index){
			case 0://白
				gl.uniform3f(u_Color, 1.0, 1.0, 1.0);
				break;
			case 1://粉
				gl.uniform3f(u_Color, 1.0, 0.86, 0.95);
				break;
			case 2://绿
				gl.uniform3f(u_Color, 0.62, 0.98, 0.83);
				break;
			case 3://天蓝
				gl.uniform3f(u_Color, 0.0, 1.0, 1.0);
				break;
		}
	}
	var colorIn = document.getElementById("ColorIn");

	//添加页面窗口resize事件响应
	window.onresize = function(){
		var rect = canvas.getBoundingClientRect();
		canvas.width = innerWidth - 2 * rect.left;
		canvas.height = innerHeight - 80;
		if(canvas.width > canvas.height)
			gl.viewport((canvas.width - canva.height) / 2,
				0, canvas.height, canvas.height);
		else
			gl.viewport(0, (canvas.height - canva.width) / 2,
				canvas.width, canvas.width);
	}
	
	
	//进行绘制
	render();
};

//记录上一次调用函数的时刻
var last = Date.now();

//绘制函数，参数为WebGL上下文
function render(){
	//计算距离上次调用经过多长时间
	var now = Date.now();
	var elapsed = now - last;//毫秒
	last = now;
	//距离上次调用的时间，更新当前旋转角度
	angle += delta * elapsed / 1000.0;
	angle %= 360;//防止溢出
	
	gl.uniform1f(u_Angle, angle);//将旋转角度传给u_Angle
	
	gl.clear(gl.COLOR_BUFFER_BIT);//用背景色擦除窗口内容
	
	//使用顶点数组进行绘制
	//gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	//gl.drawArrays(gl.TRIANGLES, 4, 3);
	//gl.drawArrays(gl.TRIANGLES, 3, 3);

	if(change == 0){
	gl.drawArrays(gl.LINE_STRIP,0,points.length);
	}
	else{
	gl.drawArrays(gl.TRIANGLE_FAN,0,points.length);
	}
		
	requestAnimFrame(render);
}
