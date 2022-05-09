//3DVolume
var colors=[
	vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0),
	vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 0.0)];
var attributes = [];
var NumTimesToSubdivide = 4;
var NumTetrahedrons = Math.pow(4, NumTimesToSubdivide);
var NumTriangles = 4 * NumTetrahedrons;
var NumVertices = 3 * NumTriangles;
//绘制函数，参数为WebGL上下文
function triangle(a, b, c, colorIndex){
	attributes.push(a);
	attributes.push(colors[colorIndex]);
	attributes.push(b);
	attributes.push(colors[colorIndex]);
	attributes.push(c);
	attributes.push(colors[colorIndex]);
}
function tetra(a, b, c, d){
	triangle(a, b, c, 0);
	triangle(a, c, d, 1);
	triangle(a, d, b, 2);
	triangle(b, d, c, 3);
}
function divideTetra(a, b, c, d, k){
	var mid = [];
	if(k > 0){
		mid[0] = mult(0.5, add(a, b));
		mid[1] = mult(0.5, add(a, c));
		mid[2] = mult(0.5, add(a, d));
		mid[3] = mult(0.5, add(b, c));
		mid[4] = mult(0.5, add(c, d));
		mid[5] = mult(0.5, add(b, d));
		divideTetra(a, mid[0], mid[1], mid[2], k-1);
		divideTetra(mid[0], b, mid[3], mid[5], k-1);
		divideTetra(mid[1], mid[3], c, mid[4], k-1);
		divideTetra(mid[2], mid[5], mid[4], d, k-1);
	}
	else
		tetra(a, b, c, d);
}
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
	var vertices = [vec3(0.0,0.0,-1.0),//前方中心点
		vec3(0.0,0.942809,-0.333333),//底面上方点
		vec3(-0.816497,-0.471405,-0.333333),//底面左下点
		vec3(0.816497,-0.471405,-0.333333)];//底面右下点
	divideTetra(vertices[0], vertices[1], vertices[2],
		vertices[3], NumTimesToSubdivide);

	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);//设置背景色为白
	gl.enable(gl.DEPTH_TEST);
	var program = initShaders(gl,"vertex-shader","fragment-shader");
	gl.useProgram(program);//启用该shader程序对象	
	
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(attributes),gl.STATIC_DRAW);
	attributes.length = 0;
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0){
		alert("获取attribute变量a_Position失败！");
		return;
	}
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 
		Float32Array.BYTES_PER_ELEMENT * 6, 0);
	gl.enableVertexAttribArray(a_Position);//启用顶点属性数组
	
	//var colorsBufferId = gl.createBuffer();//创建buffer
	//gl.bindBuffer(gl.ARRAY_BUFFER,colorsBufferId);
	//gl.bufferData(gl.ARRAY_BUFFER,flatten(colors),gl.STATIC_DRAW);
	var a_Color = gl.getAttribLocation(program,"a_Color");
	if(a_Color < 0){
		alert("获取attribute变量a_Color失败！");
		return;
	}
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 
		Float32Array.BYTES_PER_ELEMENT * 6, 
		Float32Array.BYTES_PER_ELEMENT * 3);
	gl.enableVertexAttribArray(a_Color);	
	render(gl);
};
function render(gl){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//用背景色擦除窗口内容
	//使用顶点数组进行绘制	
	gl.drawArrays(gl.TRIANGLES, 0, NumVertices);	
}

