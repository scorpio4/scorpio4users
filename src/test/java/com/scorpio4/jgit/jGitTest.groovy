package com.scorpio4.jgit
import org.eclipse.jgit.api.AddCommand
import org.eclipse.jgit.api.CommitCommand
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.internal.storage.file.FileRepository
import org.eclipse.jgit.lib.Repository
import org.eclipse.jgit.storage.file.FileRepositoryBuilder
/**
 * scorpio4-oss (c) 2014
 * Module: com.scorpio4.jgit
 * User  : lee
 * Date  : 21/07/2014
 * Time  : 3:23 PM
 *
 *
 * @see <http://stackoverflow.com/questions/6861881/jgit-cannot-find-a-tutorial-or-simple-example>
 *
 */
class jGitTest extends GroovyTestCase {
	File gitRoot = new File("scorpio4/scorpio4tests/src/test/resources/jgit/.git");

	void testInit() {
		gitRoot.getParentFile().mkdirs();

		FileRepository repository= new FileRepository(gitRoot);
		if (!gitRoot.exists()) repository.create();

		Git git = new Git(repository);
		git.close();
	}

	void testAdd() {
		FileRepositoryBuilder builder = new FileRepositoryBuilder();
		Repository repository = builder.setGitDir(gitRoot).readEnvironment().findGitDir().build();
		builder.setIndexFile(new File(gitRoot, "index"))
		builder.setWorkTree(gitRoot.getParentFile());
		builder.setup().build();

//		FileRepository repository= new FileRepository(gitRoot.getParentFile());
		assert !repository.isBare();
		Git git = new Git(repository);


		AddCommand addCommand = git.add();
		assert addCommand !=null;
		def added = addCommand.addFilepattern(".");
		assert added !=null;
		added.call();
		git.close()
		repository.close();
	}

	void testCommit() {

		FileRepositoryBuilder builder = new FileRepositoryBuilder();
		Repository repository = builder.setGitDir(gitRoot).readEnvironment().findGitDir().build();
		builder.setIndexFile(new File(gitRoot, "index"))
		builder.setWorkTree(gitRoot.getParentFile());
		builder.setup().build();

//		FileRepository repository= new FileRepository(gitRoot.getParentFile());
		assert !repository.isBare();
		Git git = new Git(repository);


		AddCommand addCommand = git.add();
		assert addCommand !=null;
		def added = addCommand.addFilepattern(".");
		assert added !=null;
		added.call();

		CommitCommand commit = git.commit();
		commit.setMessage("committed @ "+new Date())

		def revCommit = commit.call();
		git.close()
		repository.close();
	}

}
