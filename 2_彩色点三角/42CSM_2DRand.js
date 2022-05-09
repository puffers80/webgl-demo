//实验二 42CSM_2DRand
var NumPoints = 20000;//用5000个点绘制Sierpinski镂垫
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
		vec2(0,0.98),vec2(-0.84,-0.49),vec2(0.84,-0.49),
		vec2(-0.84,0.49),vec2(0.84,0.49),vec2(0,-0.98)	
	];

	
	//在三角形内部随机选择一个初始点
	var a = Math.random();//a为[0,1)之间的随机值
	var b = (1-a)*Math.random();//b为[0,1-a)之间的随机值
	//p为三角形三个顶点坐标的加权和，权值之和为1，这样p一定在三角形内部
	var p = add(mult(a,vertices[0]),
				add(mult(b,vertices[1]),mult(1-a-b,vertices[2])));
	var q = add(mult(a,vertices[3]),
				add(mult(b,vertices[4]),mult(1-a-b,vertices[5])));
	//在命令控制台输出p坐标
	console.log("初始点p:(%f,%f)",p[0],p[1]);
	console.log("初始点q:(%f,%f)",q[0],q[1]);	

	var colors=[];

	
	//计算并储存NumPoints个顶点坐标
	for(var i = 0;i<NumPoints;++i)
	{
		var j = Math.floor(Math.random()*3);//随机选择一个三角形的顶点,j=0/1/2
		var p = mult(0.5,add(p,vertices[j]));//随机选择的顶点和p点之间的中点
		points.push(p);//将新顶点添加到数组points中
		colors.push(vec3(Math.random(), Math.random(), Math.random()));		
	}
	for(var i = 0;i<NumPoints;++i)
	{
		var j = Math.floor(Math.random()*3)+3;//随机选择一个三角形的顶点,j=0/1/2
		var q = mult(0.5,add(q,vertices[j]));//随机选择的顶点和q点之间的中点
		points.push(q);//将新顶点添加到数组points中
		colors.push(vec3(Math.random(), Math.random(), Math.random()));		
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