//实验二 42CSM_2DRand
var NumPoints = 20000;//绘制Sierpinski镂垫
var points = [];//存放顶点坐标的数组

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
	//指定顶点
	var vertices=[
	/*	vec2(0,0.70),vec2(-0.56,-0.35),vec2(0.56,-0.35),
		vec2(-0.56,0.35),vec2(0.56,0.35),vec2(0,-0.70)	*/
		vec2(0,0.98),vec2(0.79,0.61),vec2(0.98,-0.25),
		vec2(0.45,-0.9),vec2(-0.45,-0.9),vec2(-0.98,-0.25),
		vec2(-0.79,0.61),vec2(0,0)
	];
	var colors=[];
	var p = vertices[7];
	//计算并储存NumPoints个顶点坐标
	for(var i = 0;i<30000;++i)
	{
		var j = Math.floor(Math.random()*7);//随机选择一个三角形的顶点,j=0/1/2
		if(i<20000)
		{var p = mult(0.5,add(p,vertices[j]));}//随机选择的顶点和p点之间的中点
		else 
		{var p = mult(0.4,add(p,vertices[j]));}
		points.push(p);//将新顶点添加到数组points中
		if(j==0)
			{colors.push(vec3(1.0,0.0,0.0));}
		else if(j==1)
			{colors.push(vec3(0.98,0.625,0.12));}
		else if(j==2)
			{colors.push(vec3(1.0,1.0,0));}
		else if(j==3)
			{colors.push(vec3(0,1.0,0));}
		else if(j==4)
			{colors.push(vec3(0,1.0,1.0));}
		else if(j==5)
			{colors.push(vec3(0,0,1.0));}
		else if(j==6)
			{colors.push(vec3(1.0,0.0,1.0));}		
	}
	for(var i = 0;i<20000;++i)
	{
		var j = Math.floor(Math.random()*7);//随机选择一个三角形的顶点,j=0/1/2
		var p = mult(0.3,add(p,vertices[j]));//随机选择的顶点和p点之间的中点
		points.push(p);//将新顶点添加到数组points中
		colors.push(vec3(1.0,1.0,1.0));
	}
	for(var j = 0;j<=6;++j)
	{
		var q = vertices[7];
		for(var i = 0;i<200;++i)
		{
			if(j==6)
			{var z = mult(0.001*i,add(vertices[j],vertices[0]));}
			else
			{var z = mult(0.001*i,add(vertices[j],vertices[j+1]));}
			points.push(z);
			colors.push(vec3(1.0,1.0,1.0));
		}
	}
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.0,0.0,0.0,1.0);//设置背景色为075*3+1.0
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
	
	var colorsBufferId = gl.createBuffer();//创建buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,colorsBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);
	var a_Color = gl.getAttribLocation(program,"a_Color");
	if(a_Color < 0){
		alert("获取attribute变量a_Color失败！");
		return;
	}
	gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_Color);	
	render(gl);
};

//绘制函数，参数为WebGL上下文
function render(gl){
	gl.clear(gl.COLOR_BUFFER_BIT);//用背景色擦除窗口内容
	//使用顶点数组进行绘制	
	gl.drawArrays(gl.POINTS,0,points.length);	
}