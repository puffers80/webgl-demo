var gl;// WebGL上下文
var halfSize=1;//正方形边长的一半
var u_MVPMatrix;
var matProj;
var angle=[0.0,0.0,0.0];
var axis=1;
var delta=60;
var nVertexCountPerSide=4;
var nVertexCount =nVertexCountPerSide*2+1;//一个面的顶点数9
var time=0;
var u_Time;
var nTriangleCount= nVertexCountPerSide*2;//三角形的个数 
var nIndexCount=3*(nTriangleCount);//索引数

window.onload = function main(){
	// 获取页面中id为webgl的canvas元素
    var canvas = document.getElementById("webgl");
	if(!canvas){ // 获取失败？
		alert("获取canvas元素失败！"); 
		return;
	}
	
	// 利用辅助程序文件中的功能获取WebGL上下文
	// 成功则后面可通过gl来调用WebGL的函数
    gl = WebGLUtils.setupWebGL(canvas);    
    if (!gl){ // 失败则弹出信息
		alert("获取WebGL上下文失败！"); 
		return;
	}        

	/*设置WebGL相关属性*/
	// 设置视口，占满整个canvas
	gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0,0.0,0.0, 1.0); // 设置背景色
	gl.enable(gl.DEPTH_TEST);	// 开启深度检测
	gl.enable(gl.CULL_FACE);	// 开启面剔除，默认剔除背面
	matProj=ortho(-halfSize*2,halfSize*2,  //x范围
		-halfSize*2,halfSize*2,  //y范围
		-halfSize*2,halfSize*2);   //z范围
	/*顶点坐标数据初始化*/
	var R=halfSize;
	var r=halfSize/2+0.1;
	var vertices=[];
	var x=0;
	var y=0;
	vertices.push(vec3(x,y,halfSize));//原点
	//vertices[0]是原点
	vertices.push(vec3(x,R+y,halfSize));
	vertices.push(vec3(Math.sin(30)*r+x,Math.cos(60)*r+y,halfSize));
	vertices.push(vec3(R+x,y,halfSize));
	vertices.push(vec3(Math.sin(30)*r+x,-Math.cos(60)*r+y,halfSize));
	vertices.push(vec3(x,-R+y,halfSize));
	vertices.push(vec3(-Math.sin(30)*r+x,-Math.cos(60)*r+y,halfSize));
	vertices.push(vec3(-R+x,y,halfSize));
	vertices.push(vec3(-Math.sin(30)*r+x,Math.cos(60)*r+y,halfSize));
	//所有顶点
	var indexes=new Uint16Array(nIndexCount);
	var index=0;
	for(var i = 0; i <nVertexCount-1; i ++){
		if(i==nVertexCount-2){
		indexes[index++]=0;
		indexes[index++]=nVertexCount-1;
		indexes[index++]=1;
		}
		else{
			indexes[index++]=0;
			indexes[index++]=i+1;
			indexes[index++]=i+2;
		}
	}
	
	/*创建并初始化一个缓冲区对象(Buffer Object)，用于存顶点坐标*/
	var verticesBufferId = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 	 
	 	flatten(vertices),//申请空间大小
		gl.STATIC_DRAW ); 

	/*创建并初始化一个缓冲区对象(Buffer Object)，用于存顶点索引序列*/
	
	var indexBufferId = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferId);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 	 
	 	indexes,//申请空间大小
		gl.STATIC_DRAW ); 

    var program = initShaders(gl, "vertex-shader", 
		"fragment-shader");
    gl.useProgram(program);	// 启用该shader程序对象 
	
	/*初始化顶点着色器中的顶点位置属性*/
	var a_Position = gl.getAttribLocation(program, "a_Position");
	if(a_Position < 0){ 
		alert("获取attribute变量a_Position失败！"); 
		return;
	}
	
    gl.vertexAttribPointer(a_Position, 
		3,
		gl.FLOAT, 
		false, 	  
		0,
		0);		  
    gl.enableVertexAttribArray(a_Position);  

	/*获取shader中uniform变量索引*/
	u_MVPMatrix=gl.getUniformLocation(program,"u_MVPMatrix");
	if(!u_MVPMatrix){
		alert("获取uniform变量u_MVPMatrix失败！");
		return;
	}
	u_MinDist=gl.getUniformLocation(program,"u_MinDist");
	if(!u_MinDist){
		alert("获取uniform变量u_MinDist失败！");
		return;
	}
	u_MaxDist=gl.getUniformLocation(program,"u_MaxDist");
	if(!u_MaxDist){
		alert("获取uniform变量u_MaxDist失败！");
		return;
	}
	/*F_repeat = gl.getUniformLocation(program,"potten");
	if(!F_repeat){
		alert("获取uniform变量potten失败");
		return;
	}*/
	
	u_Time=gl.getUniformLocation(program,"u_Time");
	if(!u_Time){
		alert("获取uniform变量u_Time失败！");
		return;
	}
	gl.uniform1f(u_Time,1.0);
	gl.uniform1f(u_MinDist,halfSize);
	gl.uniform1f(u_MaxDist,halfSize*Math.sqrt(3.0));

	canvas.onmousedown=function(){
		switch(event.button){
			case 0:
				axis = 0;//鼠标左键绕x轴旋转
				break;
			case 1:
				axis = 1;//鼠标中键绕y轴旋转
				break;
			case 2:
				axis = 2//鼠标右键绕z轴旋转
				break;	
		}
	};
	canvas.oncontextmenu=function(){
		event.preventDefault();
	};
	// 进行绘制
    render();

};

var last=Date.now();
function animation(){
	var now  = Date.now();
	var elpsed = now -last;
	last =now;
	angle[axis] += delta*elpsed/1000.0;
	angle[axis] %= 360;//防止溢出	
	time += elpsed/1000.0;//毫秒
	if(time>2)time-=2;
	gl.uniform1f(u_Time,time);
}


// 绘制函数
function render() {
	animation();
	// 清颜色缓存和深度缓存
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var matMVP=mult(matProj,mult(rotateX(angle[0]),
	mult(rotateY(angle[1]),rotateZ(angle[2]))));

	gl.uniformMatrix4fv(u_MVPMatrix,false,flatten(matMVP)); //front
	gl.drawElements(gl.LINE_LOOP,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix,false,flatten(mult(matMVP,rotateX(180)))); //back
	gl.drawElements(gl.LINE_LOOP,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix,false,flatten(mult(matMVP, rotateX(90))));//bottom
	gl.drawElements(gl.LINE_LOOP,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix,false,flatten(mult(matMVP, rotateX(-90))));//top
	gl.drawElements(gl.LINE_LOOP,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix,false,flatten(mult(matMVP,rotateY(-90))));  //left
	gl.drawElements(gl.LINE_LOOP,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix,false,flatten(mult(matMVP,rotateY(90))));  //right
	gl.drawElements(gl.LINE_LOOP,nIndexCount,gl.UNSIGNED_SHORT,0);
	
	requestAnimFrame(render);
}
