echo ---------------------INSTALLING CAPTCHA SOLVER TO DOCKER-----------------------------

echo stop all docker containers
docker stop $(docker ps -aq)

echo remove all docker containers
docker rm $(docker ps -aq)

docker pull tensorflow/serving

cd --
cd Documents
cd ChromeExtensions
cd ETRACKER3
cd captcha_solver_api_docker

echo pwd is relative path


docker run -p 8501:8501 \
 --name captcha_solver --mount type=bind,\source=`pwd`/resnet,target=/models/resnet \
-e MODEL_NAME=resnet -t tensorflow/serving &

echo to have captcha solver always running enter code below and replace containerID
echo docker update --restart=always 4362fa682ffb

docker update --restart=always captcha_solver



echo NOTE FOR LOW RAM DESKTOPS, less then 4gb , must right click icon tray for docker -- > settings --> advanced settings, and use ram as 1gb!

echo sometimes wont work because space in name, so move to dir without space
echo docker run -p 8501:8501 \
echo --name captcha_solver --mount type=bind,source=/c/Users/resnet,target=/models/resnet \
echo -e MODEL_NAME=resnet -t tensorflow/serving &