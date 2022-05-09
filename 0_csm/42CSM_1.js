//实验一程序(42CSM_1.js)
window.onload = function main(){
	//获取页面中id为webgl的canvas元素
	var canvas = document.getElementById("webgl");
	if(!canvas){
		alert("获取canvas元素失败！");
		return;
	}
	var gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){//失败弹出信息
		alert("获取WebGL上下文失败！");
		return;
	}
	//顶点位置数据数组
	var vertices=[
	//外框0~4
	vec2(-0.91,0.91),vec2(0.91,0.91),vec2(0.91,-0.91),
	vec2(-0.91,-0.91),vec2(-0.91,0.91),		
	//左上右下顺时针5~17
	vec2(-0.94,0.86),vec2(-0.86,0.86),vec2(-0.86,0.94),
	vec2(0.86,0.94),vec2(0.86,0.86),vec2(0.94,0.86),
	vec2(0.94,-0.86),vec2(0.86,-0.86),vec2(0.86,-0.94),	
	vec2(-0.86,-0.94),vec2(-0.86,-0.86),vec2(-0.94,-0.86),vec2(-0.94,0.86),
	//C:18~25
	vec2(-0.196,-0.112),vec2(-0.308,-0.224),vec2(-0.532,-0.224),
	vec2(-0.644,-0.112),vec2(-0.644,0.112),vec2(-0.532,0.224),
	vec2(-0.308,0.224),vec2(-0.196,0.112),
	//S:26~37
	vec2(-0.63,0.42),vec2(-0.84,0.21),vec2(-0.84,-0.21),vec2(-0.63,-0.42),
	vec2(-0.21,-0.42),vec2(0,-0.21),vec2(0,0.21),vec2(0.21,0.42),			
	vec2(0.63,0.42),vec2(0.84,0.21),vec2(0.84,-0.21),vec2(0.63,-0.42),
	//M:38~45		
	vec2(0.19,-0.22),vec2(0.25,0.19),vec2(0.346,0.19),vec2(0.394,-0.22),
	vec2(0.418,-0.22),vec2(0.466,0.19),vec2(0.562,0.19),vec2(0.622,-0.22)	
	];
	var colors=[
		//外框5
		vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),
		vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),	
		//左上右下13
		vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),
		vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),
		vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),
		vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),vec3(1.0,1.0,1.0),
		vec3(1.0,1.0,1.0),
		//C8
		vec3(0.0,1.0,1.0),vec3(0.1,1.0,0.1),vec3(1.0,1.0,0.0),
		vec3(0.98,0.625,0.12),vec3(1.0,1.0,1.0),vec3(0.6,0.4,1.0),
		vec3(0.8,0.8,1.0),vec3(0.0,1.0,1.0),
		//S12
		vec3(0.6,0.4,1.0),vec3(1.0,1.0,1.0),vec3(0.98,0.625,0.2),
		vec3(1.0,1.0,0.0),vec3(0.1,1.0,0.1),vec3(0.0,1.0,1.0),
		vec3(0.0,1.0,1.0),vec3(0.1,1.0,0.1),vec3(1.0,1.0,0.0),
		vec3(0.98,0.625,0.2),vec3(1.0,1.0,1.0),vec3(0.6,0.4,1.0),
		//M8
		vec3(0.0,1.0,1.0),vec3(0.1,1.0,0.1),vec3(1.0,1.0,0.0),
		vec3(0.8,0.8,1.0),vec3(0.6,0.4,0.9),
		vec3(1.0,1.0,0.0),vec3(0.98,0.625,0.2),vec3(1.0,1.0,1.0)
	];

	gl.viewport(0,0,canvas.width,canvas.height);//设置视口
	gl.clearColor(0.6,0.8,0.9,1.0);//设置背景色1.0,1.0,1.0,1.0
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);//启用该shader程序对象
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0){
		alert("获取attribute变量a_Position失败！");
		return;
	}	
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
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
	//外框
	for(i=0;i<17;i++){
		if(i==4){i++;}
		gl.drawArrays(gl.LINE_LOOP,i,2);	
	}
	//C
	gl.drawArrays(gl.TRIANGLE_STRIP,18,8);
	//S
	gl.drawArrays(gl.TRIANGLE_STRIP,26,12);	
	//M
	gl.drawArrays(gl.TRIANGLE_STRIP,38,8);	

}