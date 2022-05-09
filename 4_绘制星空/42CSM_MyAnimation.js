var MaxNumSquares = 1000;//最多支持1000个
//顶点数，每个正方形含2个三角形，即6个顶点
var MaxNumVertices = MaxNumSquares * 6;
var MaxHalfSize = 20.0;
var HalfSize;//随机大小
var count = 0;	//个数
var canvas;		//canvas元素
var gl;			//WebGL上下文
var drawRect = false;
window.onload = function main(){
	//获取页面中id为webgl的canvas元素
	canvas = document.getElementById("webgl");
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
	
	//设置WebGL相关属性
	//设置视口（此处视口占满整个canvas）
	gl.viewport(0,//视口左边界距离canvas左边界距离
				0,//视口下边界距离canvas下边界距离
				canvas.width,//视口宽度
				canvas.height);//视口高度
	gl.clearColor(0.0,0.0,0.0,1.0);//设置背景色为
	/*加载shader程序并未shader中attribute变量提供数据
	加载id分别为"vertex-shader"和"fragment-shader"的shader程序
	并进行编译和链接，返回shader程序对象program*/
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);//启用该shader程序对象
	
	//将顶点属性数据传输到GPU
	var databufferId = gl.createBuffer();
	//将id为bufferId的buffer绑定为当前Arry Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,databufferId);
	//为当前Array Buffer提供数据，传输到GPU
	gl.bufferData(gl.ARRAY_BUFFER,//Buffer类型
		Float32Array.BYTES_PER_ELEMENT * 6 * MaxNumVertices,//申请空间大小
		gl.STATIC_DRAW);//表明将如何使用Buffer(STATIC_DRAW表明是一次提供数据,多遍绘制)
	/*为shader属性变量与buffer数据建立关联
	获取名称为"a_Position"的shader attribute变量的位置*/
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0){//getAttribLocation获取失败返回-1
		alert("获取attribute变量a_Position失败！");
		return;
	}
	//指定利用当前Arry Buffer为a_Position提供数据的具体方式
	gl.vertexAttribPointer(a_Position,
		3,//每个顶点属性有3个分量
		gl.FLOAT,//数组数据类型(浮点型)
		false,//不进行归一化处理
		Float32Array.BYTES_PER_ELEMENT * 6,//相邻顶点属性首址间隔
		0);//第一个顶点属性在Buffer中偏移量为0字节
	gl.enableVertexAttribArray(a_Position);//启用顶点属性数组
	/*为shader属性变量与buffer数据建立关联
	获取名称为"a_Color"的shader attribute变量的位置*/
	var a_Color = gl.getAttribLocation(program,"a_Color");
	if(a_Color < 0){//getAttribLocation获取失败返回-1
		alert("获取attribute变量a_Color失败！");
		return;
	}
	//指定利用当前Arry Buffer为a_Color提供数据的具体方式
	gl.vertexAttribPointer(a_Color,
		3,//每个顶点属性有3个分量
		gl.FLOAT,//数组数据类型(浮点型)
		false,//不进行归一化处理
		Float32Array.BYTES_PER_ELEMENT * 6,//相邻顶点属性首址间隔
		Float32Array.BYTES_PER_ELEMENT * 3);//第一个顶点属性在Buffer中偏移量
	gl.enableVertexAttribArray(a_Color);//启用顶点属性数组
	
	//获取shader中uniform变量u_matMVP的位置
	var u_matMVP = gl.getUniformLocation(program, "u_matMVP");
	if(!u_matMVP){
		alert("获取uniform变量u_matMVP失败！");
		return;
	}
	var matProj = ortho2D(0, canvas.width, 0, canvas.height);
	gl.uniformMatrix4fv(u_matMVP, false, flatten(matProj));
	canvas.onclick = function(){
		addSquare(event.clientX, event.clientY);
	}
	gl.clear(gl.COLOR_BUFFER_BIT);

	//鼠标左键按下移动时也可绘制正方形
	canvas.onmousedown = function(){
		if(event.button == 0)
			drawRect = true;
	};	
	//为canvas添加鼠标键弹起事件监听器
	canvas.onmouseup = function(){
		if(event.button == 0)
			drawRect = false;
	};	
	//为canvas添加鼠标键移动事件监听器
	canvas.onmousemove = function(){
		if(drawRect)
			addSquare(event.clientX, event.clientY);
	};
};

//绘制函数，参数为WebGL上下文
function render(){
	gl.clear(gl.COLOR_BUFFER_BIT);//用背景色擦除窗口内容	
	//使用顶点数组进行绘制
	gl.drawArrays(gl.TRIANGLES, 0, count * 6);//TRIANGLE_FAN
}

function addSquare(x, y){
	if(count >= MaxNumSquares){
		alert("正方形数目已达到上限！");
		return;
	}
	var rect = canvas.getBoundingClientRect();
	x = x - rect.left; 
	y = canvas.height - (y - rect.top);
	var HalfSize = MaxHalfSize * Math.random();//每个大小随机
	var a =Math.cos(Math.PI / 6);
	var b = Math.sin(Math.PI / 6);
	var vertices = [
		vec3(x, y+HalfSize, 0),//左上
		vec3(x-HalfSize*a, y-HalfSize*b, 0),//右下
		vec3(x+HalfSize*a, y-HalfSize*b, 0),//右下
		vec3(x-HalfSize*a, y+HalfSize*b, 0),//左下
		vec3(x, y-HalfSize, 0),//左上
		vec3(x+HalfSize*a, y+HalfSize*b, 0)//右上
	];
	var data = [];
	var colors = [
	vec3(1.0,1.0,0.0),vec3(1.0,1.0,0.0),vec3(1.0,1.0,0.0),
	vec3(1.0,1.0,0.0),vec3(1.0,1.0,0.0),vec3(1.0,1.0,0.0)
	];
	
	for(var i = 0; i < 6; i++){
		data.push(vertices[i]);
		data.push(colors[i]);
	}
	vertices.length = 0;
	
	gl.bufferSubData(gl.ARRAY_BUFFER,
		count * 6 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
		flatten(data));
	data.length = 0;
	count++;
	requestAnimFrame(render);
}


