properties([pipelineTriggers([githubPush()])])

def acrUrl = '<acr-name>.azurecr.io'
def gitHubRepoUrl = '<github-repo-url>'
def image = "${acrUrl}/host-id"
def shortCommit = ''
def tag = ''

def acrCredentialsId = 'acr'
node {
    def built_img = ''
    stage('Checkout git repo') {
      sh 'ls /root/.kube'
      sh 'which kubectl'
      git branch: 'master', url: gitHubRepoUrl
      gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
      shortCommit = gitCommit.take(6)
      tag = "${shortCommit}.${env.BUILD_NUMBER}"
    }
    stage('run tests') {
        dir('host-id-app'){
            sh 'npm test'
        }
    }
    stage('Build Docker image') {
        dir('host-id-app'){
            built_img = docker.build("${image}:${tag}", '.')
        }    
    }
    ////commenting usage of dockerp plugin since its broken with docker 1.12 (using of .dockercfg is deprecated)
    ////and uses only .docker/config which is not created by the withRegistry method
    //stage('Push Docker image to Azure Container Registry') {
    //    docker.withRegistry("https://${acrUrl}", acrCredentialsId) {
    //        built_img.push(tag);
    //  }
    //}
    stage('Push Docker image to Azure Container Registry') {
       
        withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: acrCredentialsId,
        usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
            sh "docker login https://${acrUrl} -u $USERNAME -p $PASSWORD"
            sh "docker push ${image}:${tag}"
      }
    }
    stage('rollout deployment in kubernetes'){
        
        sh "kubectl get deployment host-id -n default || kubectl run host-id --port 3000 --image ${image}:${tag} -n default"
        //expose if not yet exposed
        sh 'kubectl get svc host-id -n default || kubectl expose deployment/host-id --type LoadBalancer -n default --port 80 --target-port 3000'
        
        sh "kubectl set image deployment/host-id *=${image}:${tag} -n default"
    }
}
