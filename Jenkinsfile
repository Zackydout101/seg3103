pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Automated Tests') {
            parallel {
                stage('Python Tests') {
                    steps {
                        sh './scripts/test-python.sh'
                    }
                }

                stage('JavaScript Tests') {
                    steps {
                        sh './scripts/test-javascript.sh'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'python-backend/coverage.xml', allowEmptyArchive: true
            archiveArtifacts artifacts: 'js-backend/coverage/**', allowEmptyArchive: true
        }
    }
}
