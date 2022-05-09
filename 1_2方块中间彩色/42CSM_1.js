//实验一程序(42CSM_1.js)
//页面加载完成后会调用次函数，函数名可任意(不一定是main)
window.onload = function main(){
	//获取页面中id为webgl的canvas元素
	var canvas = document.getElementById("webgl");
	if(!canvas){
		alert("获取canvas元素失败！");
		return;
	}
	/*利用辅助程序文件中的功能获取WebGL上下文
	成功则后面可通过gl来调用webgl函数*/
	var gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){//失败弹出信息
		alert("获取WebGL上下文失败！");
		return;
	}
	//顶点位置数据数组(由两个三角形构成一个正方形)
	var vertices=[
		/*vec2(0,-1),vec2(1,-1),vec2(0,1),//第一个三角形
		vec2(0,1),vec2(1,-1),vec2(1,1)//第二个三角形
		vec2(0,-1),vec2(1,-1),vec2(0,1),vec2(1,1)//32三角扇  23三角条带*/
		vec2(-0.5,-0.5),vec2(0.5,-0.5),vec2(-0.5,0.5),vec2(0.5,0.5)
	];
	var colors=[
		vec3(1.0,0.0,0.0),//red
		vec3(0.0,1.0,0.0),//green
		vec3(0.0,0.0,1.0),//blue
		vec3(1.0,1.0,1.0),//white
	];
	//设置WebGL相关属性
	//设置视口（此处视口占满整个canvas）
	gl.viewport(0,//视口左边界距离canvas左边界距离
				0,//视口下边界距离canvas下边界距离
				canvas.width,//视口宽度
				canvas.height);//视口高度
	gl.clearColor(0.75,0.75,0.75,1.0);//设置背景色为
	/*加载shader程序并未shader中attribute变量提供数据
	加载id分别为"vertex-shader"和"fragment-shader"的shader程序
	并进行编译和链接，返回shader程序对象program*/
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);//启用该shader程序对象
	
	//将顶点属性数据传输到GPU
	var verticesBufferId = gl.createBuffer();
	//将id为bufferId的buffer绑定为当前Arry Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	//为当前Array Buffer提供数据，传输到GPU
	gl.bufferData(gl.ARRAY_BUFFER,//Buffer类型
		flatten(vertices),//Buffer数据来源,flatten将vertices转换为GPU可接受的格式
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
	
	var colorsBufferId = gl.createBuffer();//创建buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,colorsBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,//Buffer类型
		flatten(colors),gl.STATIC_DRAW);
	var a_Color = gl.getAttribLocation(program,"a_Color");
	if(a_Color < 0){
		alert("获取attribute变量a_Color失败！");
		return;
	}
	gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Color);


	
	//进行绘制
	render(gl);
};

//绘制函数，参数为WebGL上下文
function render(gl){
	gl.clear(gl.COLOR_BUFFER_BIT);//用背景色擦除窗口内容
	//使用顶点数组进行绘制
	gl.drawArrays(gl.TRIANGLE_STRIP,//TRIANGLE_STRIP绘制图元类型为三角条带TRIANGLE_FAN三角扇,TRIANGLES三角形
	0,//从第0个顶点属性数据开始绘制
	4);//4:四个顶点绘制. 6:从第6个顶点属性数据(即画2个三角形,注意不是三角形个数)
}