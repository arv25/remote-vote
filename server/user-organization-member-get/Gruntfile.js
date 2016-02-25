var grunt = require('grunt');
grunt.loadNpmTasks('grunt-aws-lambda');

grunt.initConfig({
  lambda_invoke: {
    default: {
    }
  },
  lambda_package: {
    default: {
      options: {
        include_time: false
      }
    },
    prod: {
      options: {
        include_time: false
      }
    }
  },
  lambda_deploy: {
    default: {
      arn: 'arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-organization-member-get',
      options: {
        aliases: 'stag',
        enableVersioning: true
      }
    },
    prod: {
      arn: 'arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-organization-member-get',
      options: {
        aliases: 'prod',
        enableVersioning: true
      }
    }
  }
});

grunt.registerTask('deploy',      ['lambda_package:default', 'lambda_deploy:default']);
grunt.registerTask('deploy_prod', ['lambda_package:prod', 'lambda_deploy:prod']);
grunt.registerTask('deploy_all',  ['lambda_package:default', 'lambda_deploy:default', 'lambda_package:prod','lambda_deploy:prod']);
